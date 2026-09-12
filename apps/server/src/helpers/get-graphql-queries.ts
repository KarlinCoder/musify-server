import path from "path";

import { importAsText } from "./import-as-text";

const graphqlDir = path.resolve(import.meta.dirname, "../src/graphql");

const query = (file: string) => importAsText(path.join(graphqlDir, file));

export const searchQuery = query("search.graphql");

export const getTrackQuery = query("get_track.graphql");

export const getAlbumQuery = query("get_album.graphql");
export const getArtistQuery = query("get_artist.graphql");
export const getArtistMixQuery = query("get_artist_mix.graphql");
export const getChartsQuery = query("get_charts.graphql");
export const getPlaylistQuery = query("get_playlist.graphql");
export const getSimilarTracksQuery = query("get_similar_tracks.graphql");
export const getSimilarArtistQuery = query("get_similar_artists.graphql");
export const getTrackMixQuery = query("get_track_mix.graphql");
