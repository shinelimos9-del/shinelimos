import { useState, useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import axios from "axios";
import { MAPBOX_PUBLIC_TOKEN } from "../data";

interface AddressSearchProps {
  value: string;
  onChange: (address: string, details: any) => void;
  placeholder: string;
  className?: string;
}

export default function AddressSearch({ value, onChange, placeholder, className }: AddressSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText: string) => {
    if (searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/search/searchbox/v1/suggest`,
        {
          params: {
            q: searchText,
            access_token: MAPBOX_PUBLIC_TOKEN,
            session_token: "session-123", // Ideally generate a unique session token
            limit: 5,
            proximity: "-77.0369,38.9072", // DC area
            types: "address,poi,postcode,place"
          }
        }
      );
      setSuggestions(response.data.suggestions || []);
      setShowDropdown(true);
    } catch (error: any) {
      console.warn("Mapbox Searchbox error, falling back to Geocoding v5 API:", error?.message || error);
      try {
        const fallbackRes = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json`,
          {
            params: {
              access_token: MAPBOX_PUBLIC_TOKEN,
              proximity: "-77.0369,38.9072",
              limit: 5
            }
          }
        );
        const mapped = (fallbackRes.data.features || []).map((feature: any) => ({
          mapbox_id: feature.id,
          name: feature.text || feature.place_name,
          full_address: feature.place_name,
          isGeocodingV5: true,
          featureData: feature
        }));
        setSuggestions(mapped);
        setShowDropdown(true);
      } catch (fallbackErr) {
        console.error("Mapbox Geocoding fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (suggestion: any) => {
    setQuery(suggestion.name);
    setShowDropdown(false);

    if (suggestion.isGeocodingV5 && suggestion.featureData) {
      const feature = suggestion.featureData;
      const context = feature.context || [];
      const placeContext = context.find((c: any) => c.id?.startsWith("place"))?.text || "";
      const regionContext = context.find((c: any) => c.id?.startsWith("region"))?.short_code?.replace("US-", "") || context.find((c: any) => c.id?.startsWith("region"))?.text || "";
      const postcodeContext = context.find((c: any) => c.id?.startsWith("postcode"))?.text || "";

      const details = {
        full_address: feature.place_name || feature.text,
        city: placeContext,
        state: regionContext,
        postal_code: postcodeContext,
        lat: feature.geometry?.coordinates[1] || feature.center?.[1],
        lng: feature.geometry?.coordinates[0] || feature.center?.[0]
      };

      onChange(details.full_address, details);
      setQuery(details.full_address);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}`,
        {
          params: {
            access_token: MAPBOX_PUBLIC_TOKEN,
            session_token: "session-123"
          }
        }
      );

      const feature = response.data.features[0];
      const details = {
        full_address: feature.properties.full_address || feature.properties.name,
        city: feature.properties.context?.place?.name || "",
        state: feature.properties.context?.region?.region_code || "",
        postal_code: feature.properties.context?.postcode?.name || "",
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      };

      onChange(details.full_address, details);
      setQuery(details.full_address);
    } catch (error) {
      console.error("Mapbox Retrieve error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          className={`${className} pl-11!`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 text-gold animate-spin" />}
          {query && (
            <button 
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                onChange("", null);
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-9999 mt-2 w-full bg-black border border-white/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2">
          {suggestions.map((s) => (
            <button
              key={s.mapbox_id}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-5 py-4 text-sm text-white hover:bg-gold/20 transition-colors border-b border-white/10 last:border-0 group"
            >
              <div className="font-semibold group-hover:text-gold transition-colors">{s.name}</div>
              <div className="text-[11px] text-white/50 mt-0.5 group-hover:text-white/80 transition-colors">{s.full_address || s.place_formatted}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
