import { useQuery } from "@tanstack/react-query";
import { api } from "./methods";

export const torrentListQuery = () =>
  useQuery({
    queryKey: ["torrents"],
    queryFn: () => api.getTorrents(),
  });
