import React, {
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import ModalSearchAddress from "../ModalSearchAddress";
import ModalDriver from "../ModalDriver";
import InputMaps from "../InputMaps";
import { Search, Indicator } from "grommet-icons";
import { TravelContext } from "../../providers/travel";
import { DivModal, MapContainer } from "./styles";
import Button from "../Button";
import ModalFinishedTravel from "../ModalFinishedTravel";
import { Notification } from "grommet";
import { MapContext } from "../../providers/map";

const arrayPlace: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
)[] = ["places"];

function MapUbeer() {
  const {
    setCenter,
    response,
    hasOrigin,
    setHasOrigin,
    setOrigin,
    destination,
    setDestination,
    setResponse,
    requestError,
    setRequestError,
    getNewTravelFromAPI,
    notificationWaiting,
    setNotificationWaiting,
    messageOnRoute,
    setMessageOnRoute,
    setClientPosition,
    center,
    origin,
  } = useContext(MapContext);

  const { travelStatus } =
    useContext(TravelContext);

  const [map, setMap] = useState<google.maps.Map>();
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);

  useEffect(() => {
    const navigatorId = navigator.geolocation.watchPosition((position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      setClientPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    return () => navigator.geolocation.clearWatch(navigatorId);
  }, []);

  const onPlacesChanged = () => {
    const places = searchBox?.getPlaces();
    const place = places?.[0];

    setCenter({
      lat: place?.geometry?.location?.lat() || 0,
      lng: place?.geometry?.location?.lng() || 0,
    });
    if (center) map?.panTo(center);
  };

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const directionsCallback = useCallback(
    (
      result: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus
    ) => {
      if (result !== null && status === "OK") {
        setResponse(result);
      }
    },
    []
  );

  const directionsServiceOptions = useMemo(() => {
    return {
      origin,
      destination,
      travelMode: "DRIVING" as google.maps.TravelMode,
    };
  }, [origin, destination]);

  const directionsRendererOptions = useMemo(() => {
    return {
      directions: response,
    };
  }, [response]);

  return (
    <MapContainer>
      {requestError && (
        <Notification
          toast
          status="critical"
          title="Falha ao pedir corrida"
          message={requestError as string}
          onClose={() => setRequestError(false)}
        />
      )}
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY as string}
        libraries={arrayPlace}
      >
        <GoogleMap
          onLoad={onMapLoad}
          mapContainerStyle={{ position: "static" }}
          center={center ? center : undefined}
          zoom={15}
        >
          {notificationWaiting && travelStatus === "waiting for driver" ? (
            <Notification
              toast
              status="warning"
              title="Atenção"
              message="O seu motorista chegará em breve"
              onClose={() => setNotificationWaiting(false)}
            />
          ) : messageOnRoute && travelStatus === "in transit" ? (
            <Notification
              toast
              status="normal"
              title="Hey, aproveite e peça uma água ou uma coca para melhorar :)"
              onClose={() => setMessageOnRoute(false)}
            />
          ) : (
            ""
          )}

          {origin && destination && (
            <DirectionsService
              options={directionsServiceOptions}
              callback={directionsCallback}
            />
          )}

          {response && (
            <DirectionsRenderer options={directionsRendererOptions} />
          )}

          {!response && center && (
            <Marker
              position={center}
              options={{
                label: {
                  text: "Sua localização",
                  color: "red",
                  className: "marker",
                },
              }}
            />
          )}
        </GoogleMap>

        {!travelStatus && (
          <ModalSearchAddress>
            <DivModal>
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <InputMaps
                  icon={<Search color="#FBD50E" />}
                  placeholder={origin ? origin : "Digite Aqui"}
                  onBlur={(event) => {
                    if (!hasOrigin) {
                      setHasOrigin(true);
                    }

                    setOrigin(event.target.value);
                  }}
                />
              </StandaloneSearchBox>

              {hasOrigin && (
                <>
                  <StandaloneSearchBox
                    onLoad={onLoad}
                    onPlacesChanged={onPlacesChanged}
                  >
                    <InputMaps
                      icon={<Indicator color="#FBD50E" />}
                      placeholder={destination ? destination : "Digite Aqui"}
                      onBlur={(event) => setDestination(event.target.value)}
                    />
                  </StandaloneSearchBox>

                  <Button
                    variant="rounded"
                    onClick={getNewTravelFromAPI}
                    disabled={!origin || !destination}
                  >
                    Chamar motorista
                  </Button>
                </>
              )}
            </DivModal>
          </ModalSearchAddress>
        )}

        {(travelStatus === "waiting for driver" ||
          travelStatus === "in transit") && (
          <ModalDriver />
        )}

        {travelStatus === "finished" && (
          <ModalFinishedTravel />
        )}
      </LoadScript>
    </MapContainer>
  );
}

export default MapUbeer;
