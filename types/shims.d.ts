// Global and ambient type declarations for untyped modules and window extensions

declare module "lucide-react";

declare module "firebase/firestore";

declare module "firebase/messaging" {
  export type Messaging = any;
  export const getMessaging: any;
  export const getToken: any;
  export const onMessage: any;
  export const isSupported: any;
}

declare module "pdfjs-dist" {
  const content: any; // TODO(types): Ambient shim for untyped pdfjs-dist bundle
  export default content;
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): { promise: Promise<any> };
}

declare module "pdfjs-dist/build/pdf.worker.min.js?url" {
  const workerUrl: string;
  export default workerUrl;
}

declare module "react-star-ratings" {
  import * as React from "react";
  export interface StarRatingsProps {
    rating?: number;
    starRatedColor?: string;
    starEmptyColor?: string;
    starHoverColor?: string;
    starDimension?: string;
    starSpacing?: string;
    changeRating?: (newRating: number, name: string) => void;
    numberOfStars?: number;
    name?: string;
  }
  export default class StarRatings extends React.Component<StarRatingsProps> {}
}

declare module "react-time-picker" {
  import * as React from "react";
  export interface TimePickerProps {
    onChange?: (value: string | null) => void;
    value?: string | Date | null;
    disableClock?: boolean;
    clearIcon?: React.ReactNode;
    clockIcon?: React.ReactNode;
    className?: string;
    [key: string]: any; // TODO(types): Additional dynamic props for third-party time picker
  }
  export default function TimePicker(props: TimePickerProps): React.JSX.Element;
}

declare module "react-ripples" {
  import * as React from "react";
  export interface RipplesProps extends React.HTMLAttributes<HTMLDivElement> {
    during?: number;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }
  export default function Ripples(props: RipplesProps): React.JSX.Element;
}

declare module "@jitsi/react-sdk" {
  import * as React from "react";
  export interface JaaSMeetingProps {
    appId: string;
    roomName: string;
    jwt?: string;
    configOverwrite?: Record<string, any>; // TODO(types): Jitsi config dictionary
    interfaceConfigOverwrite?: Record<string, any>; // TODO(types): Jitsi interface config dictionary
    onApiReady?: (externalApi: any) => void; // TODO(types): Jitsi external API instance
    getIFrameRef?: (iframe: HTMLIFrameElement) => void;
    useStaging?: boolean;
  }
  export const JaaSMeeting: React.FC<JaaSMeetingProps>;
  export const JitsiMeeting: React.FC<any>; // TODO(types): Jitsi generic meeting component
}

declare module "react-select-country-list" {
  interface CountryOption {
    label: string;
    value: string;
  }
  interface CountryList {
    getData(): CountryOption[];
    getValue(label: string): string;
    getLabel(value: string): string;
  }
  export default function countryList(): CountryList;
}

interface Window {
  freighter?: {
    isConnected: () => Promise<boolean>;
    getPublicKey?: () => Promise<string>;
    signTransaction?: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>;
  };
}
