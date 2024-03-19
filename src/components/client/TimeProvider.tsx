import { useQuery } from "@tanstack/react-query";
import { createContext, useState, useEffect, useRef, useContext } from "react";
import { z } from "zod";

type TimeContextState = {
  systemTime: Date;
  internetTime: Date;
};

export const TimeContext = createContext<TimeContextState | undefined>(
  undefined
);

export const TimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [systemTime, setSystemTime] = useState(new Date());
  const systemInternetDelta = useRef(0); // in ms

  const { data: internetTime, refetch: refetchInternetTime } = useQuery(
    ["internetTime"],
    getInternetTime,
    {
      refetchInterval: 1000 * 60 * 60,
    }
  );

  useEffect(() => {
    if (internetTime) {
      const now = new Date();
      systemInternetDelta.current = internetTime.getTime() - now.getTime();
    }
  }, [internetTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    systemTime,
    internetTime: internetTime
      ? new Date(systemTime.getTime() + systemInternetDelta.current)
      : systemTime,
  };

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
};

export const useTime = () => {
  const time = useContext(TimeContext);
  if (!time) {
    throw new Error("useTime must be used within a TimeProvider");
  }
  return time;
};

const getInternetTime = async () => {
  const res = await fetch("https://worldtimeapi.org/api/ip");
  const data: unknown = await res.json();
  const parsedData = z.object({ utc_datetime: z.string() }).parse(data);
  return new Date(parsedData.utc_datetime);
};
