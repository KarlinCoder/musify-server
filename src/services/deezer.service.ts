import axios from "axios";
import { createDeezerClient } from "../lib/deezer-pipe-client";
import { proxy } from "../helpers/proxy";
import { getAverageColor } from "fast-average-color-node";
import {
  searchQuery,
  getTrackQuery,
  getAlbumQuery,
  getArtistQuery,
  getPlaylistQuery,
  getChartsQuery,
  getTrackMixQuery,
  getArtistMixQuery,
  getSimilarTracksQuery,
  getSimilarArtistQuery,
} from "../helpers/get-graphql-queries";

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    proxy,
  });
  return Buffer.from(response.data);
}

async function averageColor(url: string): Promise<string> {
  const buffer = await fetchImageBuffer(url);
  const { hex } = await getAverageColor(buffer);
  return hex;
}

export class DeezerService {
  private arl: string;

  constructor(arl: string) {
    this.arl = arl;
  }

  private client() {
    return createDeezerClient(this.arl);
  }

  async searchTracks(query: string, first?: number) {
    try {
      const result = await this.client().run(searchQuery, {
        query,
        tracksFirst: first,
      });

      console.log(result ?? []);

      const edges = result.data?.search?.results?.tracks?.edges ?? [];

      return await Promise.all(
        edges.map(async (edge: any) => {
          const node = edge.node;

          return {
            id: node.id,
            title: node.title,
            artists: node.contributors.edges.map((c: any) => ({
              id: c.node.id,
              name: c.node.name,
            })),
            image_url: node.album.cover.urls[0],
            duration_ms: node.duration,
            explicit_lyrics: node.isExplicit,
          };
        }),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error buscando canciones: " + error.message);
      }
      return null;
    }
  }

  async searchAlbums(query: string, first?: number) {
    const result = await this.client().run(searchQuery, {
      query,
      albumsFirst: first,
    });
    const edges = result.data?.search?.results?.albums?.edges ?? [];

    return await Promise.all(
edges.map(async (edge: any) => {
        const node = edge.node;
        const mainContributor = node.contributors.edges[0]?.node;

        return {
          id: node.id,
          title: node.displayTitle,
          image_url: node.cover.urls[0],
          artist: {
            id: mainContributor?.id ?? 0,
            name: mainContributor?.name ?? "",
            image_url: "",
          },
          explicit_lyrics: node.isExplicit,
          record_type: node.type,
        };
      }),
    );
  }

  async searchArtists(query: string, first?: number) {
    const result = await this.client().run(searchQuery, {
      query,
      artistsFirst: first,
    });
    const edges = result.data?.search?.results?.artists?.edges ?? [];

    return await Promise.all(
      edges.map(async (edge: any) => {
        const node = edge.node;

        return {
          id: node.id,
          name: node.name,
          image_url: node.picture.urls[0],
        };
      }),
    );
  }

  async searchPlaylists(query: string, first?: number) {
    const result = await this.client().run(searchQuery, {
      query,
      playlistsFirst: first,
    });
    const edges = result.data?.search?.results?.playlists?.edges ?? [];

    return await Promise.all(
      edges.map(async (edge: any) => {
        const node = edge.node;
        const imageUrl = node.picture?.urls?.[0] ?? "";

        return {
          id: node.id,
          title: node.title,
          image_url: imageUrl,
          nb_tracks: node.estimatedTracksCount,
          is_official: node.owner?.name === "Deezer",
        };
      }),
    );
  }

  async getTrack(trackId: string) {
    const result = await this.client().run(getTrackQuery, { trackId });
    const track = result.data?.track;

    if (!track) throw new Error("Track not found");

    const avgColor = await averageColor(track.album.cover.urls[0]);

    return {
      id: track.id,
      title: track.title,
      artists: track.contributors.edges.map((c: any) => ({
        id: c.node.id,
        name: c.node.name,
      })),
      duration_ms: track.duration,
      explicit_lyrics: track.isExplicit,
      image_url: track.album.cover.urls[0],
      avg_color: avgColor,
      lyrics: track.lyrics.synchronizedLines.map((l: any) => ({
        timestamp: l.lrcTimestamp,
        text: l.line,
        milliseconds: l.milliseconds,
        duration: l.duration,
      })),
      sizes: {
        MP3_128: track.media.estimatedSizes.MP3_128,
        MP3_320: track.media.estimatedSizes.MP3_320,
        FLAC: track.media.estimatedSizes.FLAC,
      },
    };
  }

  async getTrackPreview(trackId: string) {
    const {
      data: { preview },
    } = await axios.get(`https://api.deezer.com/track/${trackId}`, {
      proxy,
    });

    return preview;
  }

  async getAlbum(albumId: string) {
    const result = await this.client().run(getAlbumQuery, { albumId });
    const node = result.data?.album;

    if (!node) throw new Error("Album not found");

    const avgColor = await averageColor(node.cover.urls[0]);
    const mainContributor = node.contributors.edges[0]?.node;

    const tracks = await Promise.all(
      (node.tracks.edges ?? []).map(async (edge: any) => {
        const tNode = edge.node;
        const trackAvgColor = await averageColor(tNode.album.cover.urls[0]);

        return {
          id: tNode.id,
          title: tNode.title,
          artists: tNode.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: tNode.album.cover.urls[0],
          avg_color: trackAvgColor,
          duration_ms: tNode.duration,
          explicit_lyrics: tNode.isExplicit,
        };
      }),
    );

    return {
      id: node.id,
      title: node.displayTitle,
      image_url: node.cover.urls[0],
      avg_color: avgColor,
      artist: {
        id: mainContributor?.id ?? 0,
        name: mainContributor?.name ?? "",
        image_url: "",
      },
      explicit_lyrics: node.isExplicit,
      record_type: node.type,
      duration: node.duration,
      label: node.label,
      copyright: node.copyright,
      release_date: node.releaseDate,
      nb_tracks: node.tracksCount,
      tracks,
    };
  }

  async getArtist(artistId: string) {
    const result = await this.client().run(getArtistQuery, { artistId });
    const node = result.data?.artist;

    if (!node) throw new Error("Artist not found");

    const avgColor = await averageColor(node.picture.urls[0]);

    return {
      id: node.id,
      name: node.name,
      image_url: node.picture.urls[0],
      avg_color: avgColor,
      nb_albums: node.albums.edges.length,
      bio_html: node.bio?.full ?? "",
    };
  }

  async getPlaylist(playlistId: string) {
    const result = await this.client().run(getPlaylistQuery, { playlistId });
    const node = result.data?.playlist;

    if (!node) throw new Error("Playlist not found");

    const avgColor = await averageColor(node.picture.urls[0]);

    const tracks = await Promise.all(
      (node.tracks.edges ?? []).map(async (edge: any) => {
        const tNode = edge.node;
        const trackAvgColor = await averageColor(tNode.album.cover.urls[0]);

        return {
          id: tNode.id,
          title: tNode.title,
          artists: tNode.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: tNode.album.cover.urls[0],
          avg_color: trackAvgColor,
          duration_ms: tNode.duration,
          explicit_lyrics: tNode.isExplicit,
        };
      }),
    );

    return {
      id: node.id,
      title: node.title,
      image_url: node.picture.urls[0],
      avg_color: avgColor,
      nb_tracks: node.estimatedTracksCount,
      is_official: node.owner.name === "Deezer",
      add_date: new Date(),
      mod_date: new Date(),
      duration: node.estimatedDuration,
      description: node.description,
      tracks,
    };
  }

  async getPopular() {
    const result = await this.client().run(getChartsQuery);
    const charts = result.data.charts.country;

    const tracks = await Promise.all(
      charts.tracks.edges.map(async (edge: any) => {
        const node = edge.node;

        return {
          id: node.id,
          title: node.title,
          artists: node.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: node.album.cover.urls[0],
          duration_ms: node.duration,
          explicit_lyrics: node.isExplicit,
        };
      }),
    );

    const albums = await Promise.all(
      charts.albums.edges.map(async (edge: any) => {
        const node = edge.node;
        const mainContributor = node.contributors.edges[0]?.node;

        return {
          id: node.id,
          title: node.displayTitle,
          image_url: node.cover.urls[0],
          artist: {
            id: mainContributor?.id ?? 0,
            name: mainContributor?.name ?? "",
            image_url: "",
          },
          explicit_lyrics: node.isExplicit,
          record_type: node.type,
        };
      }),
    );

    const artists = await Promise.all(
      charts.artists.edges.map(async (edge: any) => {
        const node = edge.node;

        return {
          id: node.id,
          name: node.name,
          image_url: node.picture.urls[0],
        };
      }),
    );

    const playlists = await Promise.all(
      charts.playlists.edges.map(async (edge: any) => {
        const node = edge.node;

        return {
          id: node.id,
          title: node.title,
          image_url: node.picture.urls[0],
          nb_tracks: node.estimatedTracksCount,
          is_official: node.owner.name === "Deezer",
        };
      }),
    );

    return { tracks, albums, artists, playlists };
  }

  async getTrackMix(
    trackIds: string[],
    limit?: number,
    startWithInputTrack?: boolean,
  ) {
    const result = await this.client().run(getTrackMixQuery, {
      trackIds,
      limit,
      startWithInputTrack,
    });

    const rawTracks =
      result.data?.trackMix?.tracks?.map((t: any) => t.track) ?? [];

    return await Promise.all(
      rawTracks.map(async (node: any) => {
        return {
          id: node.id,
          title: node.title,
          artists: node.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: node.album.cover.urls[0],
          duration_ms: node.duration,
          explicit_lyrics: node.isExplicit,
        };
      }),
    );
  }

  async getArtistMix(artistIds: string[], limit?: number) {
    const result = await this.client().run(getArtistMixQuery, {
      artistIds,
      limit,
    });

    const rawTracks =
      result.data?.artistMix?.tracks?.map((t: any) => t.track) ?? [];

    return await Promise.all(
      rawTracks.map(async (node: any) => {
        return {
          id: node.id,
          title: node.title,
          artists: node.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: node.album.cover.urls[0],
          duration_ms: node.duration,
          explicit_lyrics: node.isExplicit,
        };
      }),
    );
  }

  async getSimilarTracks(trackId: string, nb?: number) {
    const result = await this.client().run(getSimilarTracksQuery, {
      trackId,
      nb,
    });

    const rawTracks = result.data?.track?.recommendedTracks ?? [];

    return await Promise.all(
      rawTracks.map(async (node: any) => {
        return {
          id: node.id,
          title: node.title,
          artists: node.contributors.edges.map((c: any) => ({
            id: c.node.id,
            name: c.node.name,
          })),
          image_url: node.album.cover.urls[0],
          duration_ms: node.duration,
          explicit_lyrics: node.isExplicit,
        };
      }),
    );
  }

  async getSimilarArtists(artistId: string, first?: number) {
    const result = await this.client().run(getSimilarArtistQuery, {
      artistId,
      first,
    });

    const edges = result.data?.artist?.relatedArtist?.edges ?? [];

    return await Promise.all(
      edges.map(async (edge: any) => {
        const node = edge.node;

        return {
          id: node.id,
          name: node.name,
          image_url: node.picture.urls[0],
        };
      }),
    );
  }
}
