export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured?: boolean;
};

export type Category = { id: string; name: string; slug: string };

export const BUSINESS_ADDRESS = "Suite B1, Jahi Plaza, Ben Ndi Obi Street, Jahi";
export const SITE_NAME = "Flora and Creations";
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://floraandcreations.com";
