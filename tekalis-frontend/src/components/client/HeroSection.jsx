import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const slides = [
    {
      title: "Bienvenue sur Tekalis",
      subtitle: "Produits de qualité. Prix imbattables. Livraison rapide.",
      button: "Explorer les produits",
      link: "/products",
    },
    {
      title: "🚚 Livraison Gratuite",
      subtitle: "Livraison gratuit sur Toute la region de Dakar.",
      button: "Voir les détails",
      link: "/products",
    },
    {
      title: "🔥 Nouveaux arrivages",
      subtitle: "Découvrez nos derniers produits tendance dès aujourd’hui.",
      button: "Découvrir",
      link: "/products?new=true",
    },
  ];

  return (
    <div className="relative mb-12">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="h-[200px] md:h-[250px] rounded-lg shadow-lg"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
            <p className="text-lg md:text-xl mb-6">{slide.subtitle}</p>
            <Link
              to={slide.link}
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-200 transition"
            >
              {slide.button}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSection;
