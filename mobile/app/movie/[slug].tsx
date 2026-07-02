/**
 * Movie Detail — delegates to the unified Anime Detail screen.
 * Movies on samehadaku use the same data structure as anime.
 */
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function MovieDetailRedirect() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={`/anime/${slug}` as any} />;
}
