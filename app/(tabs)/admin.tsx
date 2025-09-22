import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { adminListUsers, adminUpdateBan, adminUpdateRole, type AdminUser } from '@/services/admin';
import { useRouter } from 'expo-router';
import { SearchInput } from '@/components/search-input';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/chips/filter-chip';
import { AdminUserRow } from '@/components/admin/user-row';
import { RoleSelectModal } from '@/components/modals/role-select';

export default function AdminTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isBanned, setIsBanned] = useState<'all' | 'true' | 'false'>('all');
  const [acting, setActing] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const router = useRouter();

  const query = useMemo(() => ({ search, isBanned: isBanned === 'all' ? undefined : isBanned, page, limit: 20, sort: 'createdAt:desc' }), [search, isBanned, page]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminListUsers(query)
      .then((res) => {
        if (!mounted) return;
        if (page === 1) setItems(res.users);
        else setItems((prev) => [...prev, ...res.users]);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((e) => mounted && setError(e?.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query, page]);

  function onSubmitSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function loadMore() {
    if (loading) return;
    if (page >= totalPages) return;
    setPage((p) => p + 1);
  }

  async function toggleBan(u: AdminUser) {
    try {
      setActing(u.id);
      await adminUpdateBan(u.id, !u.isBanned);
      setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, isBanned: !u.isBanned } : x)));
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  }

  async function setRole(u: AdminUser, role: AdminUser['role']) {
    try {
      setActing(u.id);
      await adminUpdateRole(u.id, role);
      setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      setRoleTarget(null);
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  }

  function renderItem({ item }: { item: AdminUser }) {
    return (
      <AdminUserRow
        item={item}
        actingId={acting}
        onPressUser={(u) => router.push({ pathname: '/user/[username]', params: { username: u } })}
        onPressRole={(u) => setRoleTarget(u)}
        onToggleBan={(u) => toggleBan(u)}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Admin</ThemedText>
      <View style={styles.controls}>
        <SearchInput value={searchInput} onChangeText={setSearchInput} onSubmit={onSubmitSearch} placeholder="Search users" />
        <View style={styles.filterRow}>
          <FilterChip label="All" selected={isBanned === 'all'} onPress={() => { setIsBanned('all'); setPage(1); }} />
          <FilterChip label="Active" selected={isBanned === 'false'} onPress={() => { setIsBanned('false'); setPage(1); }} />
          <FilterChip label="Banned" selected={isBanned === 'true'} onPress={() => { setIsBanned('true'); setPage(1); }} />
          <Pressable onPress={onSubmitSearch} style={[styles.btn, { borderColor: border }]}> 
            <Text style={{ color: text }}>Search</Text>
          </Pressable>
        </View>
      </View>
      {loading && page === 1 ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: text }}>{error}</Text>
      ) : items.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(u) => u.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={page < totalPages ? <ActivityIndicator /> : null}
        />
      )}
      <RoleSelectModal
        visible={!!roleTarget}
        onRequestClose={() => setRoleTarget(null)}
        acting={!!roleTarget && acting === roleTarget.id}
        onSelect={(r) => roleTarget && setRole(roleTarget, r)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  controls: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  listContent: { paddingBottom: 24, gap: 10 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#111', borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  modalActions: { flexDirection: 'row', gap: 8 },
});
