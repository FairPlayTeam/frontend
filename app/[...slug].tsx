import { Redirect, useLocalSearchParams } from 'expo-router';
import NotFound from './+not-found';

export default function CatchAll() {
  const { slug } = useLocalSearchParams<{ slug?: string[] }>();
  const seg = Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined;
  if (seg && typeof seg === 'string' && seg.startsWith('@') && seg.length > 1) {
    const username = seg.slice(1);
    return <Redirect href={{ pathname: '/user/[username]', params: { username } }} />;
  }
  return <NotFound />;
}
