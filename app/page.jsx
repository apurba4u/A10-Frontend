import Hero from "../components/home/Hero";
import FeaturedEbooks from "../components/home/FeaturedEbooks";
import TopWriters from "../components/home/TopWriters";
import GenreGrid from "../components/home/GenreGrid";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedEbooks />
      <TopWriters />
      <GenreGrid />
    </div>
  );
}
