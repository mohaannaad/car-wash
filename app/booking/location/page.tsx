"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useBooking } from "../../context/BookingContext";

const defaultCenter = { latitude: 24.7136, longitude: 46.6753 };

export default function LocationStep() {
  const router = useRouter();
  const { setLocation } = useBooking();
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    ...defaultCenter,
    zoom: 14,
  });
  const [marker, setMarker] = useState(defaultCenter);
  const [address, setAddress] = useState("حرّك الدبوس أو استخدم موقعك الحالي");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ar`
      );
      const data = await res.json();
      if (data.features && data.features[0]) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress("تعذّر تحديد العنوان، بس الموقع محفوظ");
      }
    } catch {
      setAddress("تعذّر تحديد العنوان، بس الموقع محفوظ");
    }
  }, []);

  const handleMarkerDragEnd = (e: { lngLat: { lat: number; lng: number } }) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    setMarker({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddress("المتصفح مش بيدعم تحديد الموقع");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarker({ latitude: lat, longitude: lng });
        setViewState({ latitude: lat, longitude: lng, zoom: 15 });
        reverseGeocode(lat, lng);
        setLoadingLocation(false);
      },
      () => {
        setAddress("تعذّر الوصول لموقعك، حرّك الدبوس يدويًا");
        setLoadingLocation(false);
      }
    );
  };

  const handleNext = () => {
    setLocation({ lat: marker.latitude, lng: marker.longitude, address });
    router.push("/booking/schedule");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-4 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">موقع السيارة</h1>
        <p className="text-text-secondary text-sm">حدد المكان اللي هنيجي نغسل فيه السيارة</p>
      </div>

      {/* الخريطة - تاخد كل المساحة المتبقية */}
      <div className="flex-1 relative min-h-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onLoad={() => mapRef.current?.resize()}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            draggable
            onDragEnd={handleMarkerDragEnd}
            color="#19B9C6"
          />
        </Map>

        <button
          onClick={handleUseCurrentLocation}
          disabled={loadingLocation}
          className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-[0_4px_14px_rgba(16,24,40,0.12)] px-4 py-3 flex items-center gap-2 z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          <span className="text-primary text-sm font-bold">
            {loadingLocation ? "جاري التحديد..." : "استخدم موقعي الحالي"}
          </span>
        </button>
      </div>

      {/* العنوان المحدد + زرار التالي - ثابت تحت، مش متراكب فوق الخريطة */}
      <div className="shrink-0 px-5 pt-4 pb-6 bg-white flex flex-col gap-4">
        <div className="flex items-start gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-text-main text-sm leading-relaxed">{address}</p>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
        >
          تأكيد الموقع
        </button>
      </div>
    </main>
  );
}