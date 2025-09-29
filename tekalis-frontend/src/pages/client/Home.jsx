import { Link} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/client/ProductCard";
import HeroSection from "../../components/client/HeroSection";
import { fetchProducts } from "../../slices/productSlice";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { motion } from "framer-motion";

const Home = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const popularProducts = items.slice(0, 4); // Pour l’instant, on prend les 4 premiers

  return (
    <div>
      {/* 🎉 Bannière */}
      <HeroSection />

      {/* 💡 Slogan */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          🛍️ Achetez malin, achetez Tekalis.
        </h2>
        <p className="text-gray-600">
          Votre marketplace de confiance pour des produits électroniques et plus encore.
        </p>
      </div>

      
{/* Produits populaires */}
<div className="container mx-auto px-4 mb-12">
  <motion.h2
  className="text-xl sm:text-2xl font-bold text-blue-700 mb-4 flex items-center"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  ⭐ Produits populaires
</motion.h2>

  <Swiper
    modules={[Pagination]}
    spaceBetween={16}
    pagination={{ clickable: true }}
    breakpoints={{
      320: { slidesPerView: 1.2 }, // Mobile
      640: { slidesPerView: 2.2 }, // Tablette
      1024: { slidesPerView: 4 }, // Desktop
    }}
  >
    {popularProducts.map((product) => (
      <SwiperSlide key={product._id}>
        <ProductCard product={product} />
      </SwiperSlide>
    ))}
  </Swiper>
</div>

{/* Tous les produits */}
<div className="container mx-auto px-4">
  <motion.h2
  className="text-xl sm:text-2xl font-bold text-blue-700 mb-4 flex items-center"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
  viewport={{ once: true }}
>
  🆕 Tous les produits
</motion.h2>
  {isLoading ? (
    <p className="text-center">Chargement des produits...</p>
  ) : error ? (
    <p className="text-center text-red-500">{error}</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )}
</div>

    </div>
  );
};

export default Home;
