import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CanvasCard {
  id: string;
  title: string;
  image: string;
}

export interface CanvasConnection {
  apiUrl: string;
  token: string;
}

interface CardsResponse {
  cards: CanvasCard[];
}

interface CopyResponse {
  card: CanvasCard;
}

export const canvasApi = createApi({
  reducerPath: 'canvasApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getCards: builder.query<CardsResponse, CanvasConnection>({
      query: ({ apiUrl, token }) => ({
        url: `${apiUrl}/api/cards`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    copyCard: builder.mutation<CopyResponse, CanvasConnection & { id: string }>({
      query: ({ apiUrl, token, id }) => ({
        url: `${apiUrl}/api/cards/${encodeURIComponent(id)}/copy`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
  }),
});

export const { useGetCardsQuery, useCopyCardMutation } = canvasApi;
