/**
 * Watch Movie — delegates to the unified Watch screen.
 * Movie episodes use the same samehadaku episode API as anime.
 */
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function WatchMovieRedirect() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  return <Redirect href={`/watch/${episodeId}` as any} />;
}
