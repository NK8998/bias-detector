import { useEffect, useState } from "react";

export default function useWindowPopstate() {
  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    const handlePopstate = () => {
      setUrl(window.location.href);
    };

    window.addEventListener("popstate", handlePopstate);

    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  return url;
}
