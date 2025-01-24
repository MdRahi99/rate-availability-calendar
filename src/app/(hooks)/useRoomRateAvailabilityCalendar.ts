// Import necessary modules and types
import Fetch from "@/utils/Fetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

// ToDo: Add infinite query support

// Define interfaces for the data structures used in the calendar
export interface IRoomInventory {
  id: string;
  date: Dayjs;
  available: number;
  status: boolean;
  booked: number;
}

export interface IRoomRatePlans {
  id: number;
  name: string;
}

export interface IRateCalendar {
  id: string;
  date: Dayjs;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

export interface IRatePlanCalendar extends IRoomRatePlans {
  calendar: Array<IRateCalendar>;
}

export interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
}

export interface IRoomCategoryCalender extends IRoomCategory {
  inventory_calendar: Array<IRoomInventory>;
  rate_plans: Array<IRatePlanCalendar>;
}

// Define the parameters and response interfaces for the hook
interface IParams {
  property_id: number;
  start_date: string;
  end_date: string;
  cursor?: number; // Make cursor optional
}

interface IResponse {
  room_categories: Array<IRoomCategoryCalender>;
  nextCursor?: number; // available if you pass a cursor as query param
}

export default function useRoomRateAvailabilityCalendar(params: IParams) {
  return useInfiniteQuery({
    queryKey: ["property_room_calendar", params.property_id],
    
    // Modified query function to handle pagination
    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
      );

      url.search = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        cursor: pageParam.toString(),
      }).toString();

      return await Fetch<IResponse>({
        method: "GET",
        url,
      });
    },

    // Get next page parameter from the API response
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,

    // Initial page param
    initialPageParam: 0,

    // Cache time and stale time configurations
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}
