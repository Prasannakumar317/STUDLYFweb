import React from "react";
import {
  SiStripe, SiGoogle, SiVercel, SiNotion, SiSlack, SiAirbnb,
  SiHubspot, SiFigma, SiOpenai, SiShopify, SiSpotify, SiAsana,
} from "react-icons/si";

const logos = [SiStripe, SiGoogle, SiVercel, SiNotion, SiSlack, SiAirbnb, SiHubspot, SiFigma, SiOpenai, SiShopify, SiSpotify, SiAsana];

export default function TrustedBy() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <p className="text-center text-xs font-bold tracking-[0.22em] uppercase text-gray-500">
          Trusted by teams at modern companies
        </p>
        <div
          className="mt-8 relative overflow-hidden"
          style={{ maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}
        >
          <div className="marquee">
            {[...logos, ...logos].map((Icon, i) => (
              <div key={i} className="flex items-center shrink-0">
                <Icon
                  className="text-4xl md:text-5xl text-gray-400 hover:text-gray-900 transition-colors duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
