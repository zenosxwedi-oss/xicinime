import axios from 'axios'

const API_BASE_URL = 'https://www.sankavollerei.web.id/anime'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  }
})

// Samehada API
export const samehada = {
  // Get anime list
  getAnimeList: async (page = 1, limit = 12) => {
    try {
      const response = await apiClient.get('/samehada', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('Samehada API Error:', error)
      throw error
    }
  },

  // Search anime
  searchAnime: async (query) => {
    try {
      const response = await apiClient.get('/samehada/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      console.error('Samehada Search Error:', error)
      throw error
    }
  },

  // Get anime detail
  getAnimeDetail: async (id) => {
    try {
      const response = await apiClient.get(`/samehada/${id}`)
      return response.data
    } catch (error) {
      console.error('Samehada Detail Error:', error)
      throw error
    }
  },

  // Get episodes
  getEpisodes: async (id) => {
    try {
      const response = await apiClient.get(`/samehada/${id}/episodes`)
      return response.data
    } catch (error) {
      console.error('Samehada Episodes Error:', error)
      throw error
    }
  }
}

// OtakuDesu API
export const otakudesu = {
  // Get anime list
  getAnimeList: async (page = 1, limit = 12) => {
    try {
      const response = await apiClient.get('/otakudesu', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('OtakuDesu API Error:', error)
      throw error
    }
  },

  // Search anime
  searchAnime: async (query) => {
    try {
      const response = await apiClient.get('/otakudesu/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      console.error('OtakuDesu Search Error:', error)
      throw error
    }
  },

  // Get anime detail
  getAnimeDetail: async (id) => {
    try {
      const response = await apiClient.get(`/otakudesu/${id}`)
      return response.data
    } catch (error) {
      console.error('OtakuDesu Detail Error:', error)
      throw error
    }
  },

  // Get episodes
  getEpisodes: async (id) => {
    try {
      const response = await apiClient.get(`/otakudesu/${id}/episodes`)
      return response.data
    } catch (error) {
      console.error('OtakuDesu Episodes Error:', error)
      throw error
    }
  }
}

// AnimeKompi API
export const animekompi = {
  // Get anime list
  getAnimeList: async (page = 1, limit = 12) => {
    try {
      const response = await apiClient.get('/animekompi', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('AnimeKompi API Error:', error)
      throw error
    }
  },

  // Search anime
  searchAnime: async (query) => {
    try {
      const response = await apiClient.get('/animekompi/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      console.error('AnimeKompi Search Error:', error)
      throw error
    }
  },

  // Get anime detail
  getAnimeDetail: async (id) => {
    try {
      const response = await apiClient.get(`/animekompi/${id}`)
      return response.data
    } catch (error) {
      console.error('AnimeKompi Detail Error:', error)
      throw error
    }
  },

  // Get episodes
  getEpisodes: async (id) => {
    try {
      const response = await apiClient.get(`/animekompi/${id}/episodes`)
      return response.data
    } catch (error) {
      console.error('AnimeKompi Episodes Error:', error)
      throw error
    }
  }
}

// Combined API for fetching from all sources
export const api = {
  // Get trending anime from all sources
  getTrendingAnime: async () => {
    try {
      const [samehadeData, otakudesuData, animekompiData] = await Promise.all([
        samehada.getAnimeList(1, 6),
        otakudesu.getAnimeList(1, 6),
        animekompi.getAnimeList(1, 6)
      ])

      return {
        samehada: samehadeData,
        otakudesu: otakudesuData,
        animekompi: animekompiData
      }
    } catch (error) {
      console.error('Trending API Error:', error)
      throw error
    }
  },

  // Search across all sources
  searchAll: async (query) => {
    try {
      const [samehadeResults, otakudesuResults, animekompiResults] = await Promise.all([
        samehada.searchAnime(query),
        otakudesu.searchAnime(query),
        animekompi.searchAnime(query)
      ])

      return {
        samehada: samehadeResults,
        otakudesu: otakudesuResults,
        animekompi: animekompiResults
      }
    } catch (error) {
      console.error('Search All Error:', error)
      throw error
    }
  },

  // Get anime detail from specific source
  getDetailFromSource: async (source, id) => {
    try {
      if (source === 'samehada') {
        return await samehada.getAnimeDetail(id)
      } else if (source === 'otakudesu') {
        return await otakudesu.getAnimeDetail(id)
      } else if (source === 'animekompi') {
        return await animekompi.getAnimeDetail(id)
      }
    } catch (error) {
      console.error(`Detail from ${source} Error:`, error)
      throw error
    }
  }
}

export default api
