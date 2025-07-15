import { useEffect, useState } from "react";

export const CountdownDisplay = ({ onRefresh, refreshInterval = 60 }) => {
  const [countdown, setCountdown] = useState(refreshInterval);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    setCountdown(refreshInterval);
  }, [refreshInterval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          setShouldRefresh(true); // ✅ Schedule refresh safely
          return refreshInterval;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  useEffect(() => {
    if (shouldRefresh) {
      onRefresh?.();           // ✅ Safe to trigger now
      setShouldRefresh(false); // Reset flag
    }
  }, [shouldRefresh, onRefresh]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-center text-gray-400 mb-6">
      Next update in: {formatTime(countdown)}
    </div>
  );
};
