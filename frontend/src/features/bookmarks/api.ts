import { api, DEV_USER_ID } from '../../lib/api'

export const getBookmarks = async () => {
  const { data } = await api.get('/bookmarks', {
    params: { user_id: DEV_USER_ID },
  })
  return data as unknown
}

export const addBookmark = async (stableId: string) => {
  const { data } = await api.post('/bookmarks', {
    user_id: DEV_USER_ID,
    stable_id: stableId,
  })
  return data as unknown
}

export const removeBookmark = async (stableId: string) => {
  const { data } = await api.delete(`/bookmarks/${stableId}`, {
    params: { user_id: DEV_USER_ID },
  })
  return data as unknown
}
