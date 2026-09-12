import { Request, Response, Router } from "express";

import { DeezerService } from "../services/deezer.service";
import { validateSearchTrack } from "../schemas/search-track-input.schema";
import { validateSearchAlbum } from "../schemas/search-album-input.schema";
import { validateSearchArtist } from "../schemas/search-artist-input.schema";
import { validateSearchPlaylist } from "../schemas/search-playlist-input.schema";
import { validateTrack } from "../schemas/track-input.schema";
import { validateAlbum } from "../schemas/album-input.schema";
import { validateArtist } from "../schemas/artist-input.schema";
import { validatePlaylist } from "../schemas/playlist-input.schema";
import { validateTrackMix } from "../schemas/track-mix-input.schema";
import { validateArtistMix } from "../schemas/artist-mix-input.schema";
import { validateSimilarTracks } from "../schemas/similar-tracks-input.schema";
import { validateSimilarArtists } from "../schemas/similar-artists-input.schema";
import { validateTrackPreview } from "../schemas/track-preview-input.schema";
import { validateCharts } from "../schemas/charts-input.schema";

const router: Router = Router();

function getService(arl: string): DeezerService {
  return new DeezerService(arl);
}

function validationMessage(error: { issues: { message: string }[] }): string {
  return error.issues.map((issue) => issue.message).join(", ");
}

router.get("/test", async (req: Request, res: Response) => {
  const arl = req.body.arl as string;
  res.json({ arl });
});

// Tracks
// GET /track (search) — body: { q, arl, first? }
router.get("/track", async (req: Request, res: Response) => {
  const input = validateSearchTrack(req.body);
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const tracks = await getService(input.data.arl).searchTracks(
      input.data.q,
      input.data.first,
    );
    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /track/:trackId/mix — body: { arl, limit?, startWithInputTrack? }
router.get("/track/:trackId/mix", async (req: Request, res: Response) => {
  const input = validateTrackMix({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const trackMix = await getService(input.data.arl).getTrackMix(
      [input.data.trackId],
      input.data.limit,
      input.data.startWithInputTrack,
    );
    res.json(trackMix);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /track/:trackId/similar — body: { arl, nb? }
router.get("/track/:trackId/similar", async (req: Request, res: Response) => {
  const input = validateSimilarTracks({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const similarTracks = await getService(input.data.arl).getSimilarTracks(
      input.data.trackId,
      input.data.nb,
    );
    res.json(similarTracks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /track/:trackId/preview — body: { arl }
router.get("/track/:trackId/preview", async (req: Request, res: Response) => {
  const input = validateTrackPreview({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const preview = await getService(input.data.arl).getTrackPreview(
      input.data.trackId,
    );
    res.json({ preview });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /track/:trackId — body: { arl }
router.get("/track/:trackId", async (req: Request, res: Response) => {
  const input = validateTrack({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const track = await getService(input.data.arl).getTrack(input.data.trackId);
    res.json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Albums
// GET /album (search) — body: { q, arl, first? }
router.get("/album", async (req: Request, res: Response) => {
  const input = validateSearchAlbum(req.body);
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const albums = await getService(input.data.arl).searchAlbums(
      input.data.q,
      input.data.first,
    );
    res.json(albums);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /album/:albumId — body: { arl }
router.get("/album/:albumId", async (req: Request, res: Response) => {
  const input = validateAlbum({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const album = await getService(input.data.arl).getAlbum(input.data.albumId);
    res.json(album);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Artists
// GET /artist (search) — body: { q, arl, first? }
router.get("/artist", async (req: Request, res: Response) => {
  const input = validateSearchArtist(req.body);
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const artists = await getService(input.data.arl).searchArtists(
      input.data.q,
      input.data.first,
    );
    res.json(artists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /artist/:artistId/mix — body: { arl, limit? }
router.get("/artist/:artistId/mix", async (req: Request, res: Response) => {
  const input = validateArtistMix({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const artistMix = await getService(input.data.arl).getArtistMix(
      [input.data.artistId],
      input.data.limit,
    );
    res.json(artistMix);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /artist/:artistId/similar — body: { arl, first? }
router.get("/artist/:artistId/similar", async (req: Request, res: Response) => {
  const input = validateSimilarArtists({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const similarArtists = await getService(input.data.arl).getSimilarArtists(
      input.data.artistId,
      input.data.first,
    );
    res.json(similarArtists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /artist/:artistId — body: { arl }
router.get("/artist/:artistId", async (req: Request, res: Response) => {
  const input = validateArtist({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const artist = await getService(input.data.arl).getArtist(
      input.data.artistId,
    );
    res.json(artist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Playlists
// GET /playlist (search) — body: { q, arl, first? }
router.get("/playlist", async (req: Request, res: Response) => {
  const input = validateSearchPlaylist(req.body);
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const playlists = await getService(input.data.arl).searchPlaylists(
      input.data.q,
      input.data.first,
    );
    res.json(playlists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /playlist/:playlistId — body: { arl }
router.get("/playlist/:playlistId", async (req: Request, res: Response) => {
  const input = validatePlaylist({ ...req.params, ...req.body });
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const playlist = await getService(input.data.arl).getPlaylist(
      input.data.playlistId,
    );
    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Charts / popular
// GET /charts — body: { arl }
router.get("/charts", async (req: Request, res: Response) => {
  const input = validateCharts(req.body);
  if (!input.success) {
    return res.status(400).json({ error: validationMessage(input.error) });
  }

  try {
    const popular = await getService(input.data.arl).getPopular();
    res.json(popular);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
