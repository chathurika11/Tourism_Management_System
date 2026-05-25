import React from 'react';
import { Compass, Heart, Users, Globe, Home, Map } from 'lucide-react';

const images = {
  hero: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mirissa%20Beach%20Sri%20Lanka.jpg',
  history: 'https://www.travellankaconnection.com/images/destinations/gallery_Bentota_Beach_Sri_Lanka.jpg',
  cuisine: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Sri_Lankan_Rice_and_Curry.jpg',
  mission: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mirissa%20Beach%20Sri%20Lanka.jpg',
};

const festivals = [
  {
    img: 'https://media.gov.lk/images/2025/04-Kandy.jpg',
    title: 'Kandy Esala Perahera',
    desc: 'One of the oldest and grandest Buddhist festivals in Sri Lanka, featuring dancers, musicians, fire-breathers, and lavishly decorated elephants.',
  },
  {
    img: 'https://live.staticflickr.com/4247/34886315306_ef35717579.jpg',
    title: 'Vesak Festival',
    desc: 'Celebrated in May, Vesak marks the birth, enlightenment, and passing of Lord Buddha with lanterns, lights, and intricate pandals.',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Traditional_Sri_Lankan_New_Year_Celebrations.jpg/960px-Traditional_Sri_Lankan_New_Year_Celebrations.jpg',
    title: 'Sinhala & Hindu New Year',
    desc: 'Celebrated in April, this festival marks the harvest season with traditional games, sweetmeats, and cultural unity across the island.',
  },
];

const features = [
  { icon: Compass, title: 'Tour Packages', desc: 'Curated cultural, wildlife, and adventure tours across Sri Lanka' },
  { icon: Home, title: 'Hotels & Stays', desc: 'Hand-picked hotels from budget to luxury stays' },
  { icon: Map, title: 'Vehicle Rentals', desc: 'Scooters, cars, and vans for independent exploration' },
  { icon: Users, title: 'Expert Guides', desc: 'Certified local guides for authentic experiences' },
];

const AboutUs = () => {
  return (
    <div className="bg-cream overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-white py-32 bg-cover bg-center" style={{ backgroundImage: `url(${images.hero})` }}>
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-cta drop-shadow-lg">Discover SerendiGo</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light tracking-wide text-gray-200">Your trusted companion for experiencing the beauty, culture, and soul of Sri Lanka</p>
        </div>
      </section>

      {/* Sri Lanka History & Culture */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl border border-white/70 bg-white">
            <img src={images.history} alt="Sigiriya Rock Fortress, Sri Lanka" className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[440px] lg:h-[520px]" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 leading-tight">The Pearl of the Indian Ocean</h2>
            <p className="text-gray-700 leading-relaxed text-lg">Sri Lanka, known as "Serendib" and "Ceylon" in ancient times, is an island nation with over 3,000 years of recorded history. From the ancient kingdoms of Anuradhapura and Polonnaruwa to the colonial era of Portuguese, Dutch, and British rule, Sri Lanka's history is a tapestry of diverse cultural influences.</p>
            <p className="text-gray-700 leading-relaxed text-lg">The country is home to eight UNESCO World Heritage Sites, including the sacred city of Kandy, the golden temple of Dambulla, the ancient city of Sigiriya, and the old town of Galle and its fortifications.</p>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-cta">
              <p className="text-primary font-semibold italic text-lg">"Sri Lankan culture is rich with traditions, world-famous Ceylon tea, aromatic spices, and warm hospitality."</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cream to-white opacity-50 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">How SerendiGo Helps You Plan Your Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-white transform hover:-translate-y-3 transition-all duration-300">
                <div className="bg-cream group-hover:bg-white/20 rounded-2xl p-5 w-20 h-20 mx-auto mb-6 flex items-center justify-center transition-all duration-300 shadow-sm">
                  <feature.icon className="text-primary group-hover:text-cta" size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-200 transition-colors">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food & Culinary */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary mb-4 leading-tight">Culinary Delights of Sri Lanka</h2>
              <p className="text-gray-700 leading-relaxed text-lg">Sri Lankan cuisine is one of the most vibrant and flavorful in the world. From the famous rice and curry to kottu roti, hoppers, and seafood delicacies, the island offers an unforgettable gastronomic journey.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-cream/80 rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-primary mb-3">Spiced Classics</h3>
                <p className="text-gray-700">Enjoy aromatic curries, coconut sambols, and freshly ground spices that define Sri Lanka's dynamic flavors.</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-primary mb-3">Local Favorites</h3>
                <p className="text-gray-700">Taste traditional favorites like hoppers, string hoppers, and delicious tropical fruits in every meal.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative group rounded-[2rem] overflow-hidden shadow-2xl border border-white/70 bg-white">
            <img src={images.cuisine} alt="Sri Lankan rice and curry meal" className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[440px] lg:h-[540px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-cream/90 mb-2">Authentic Cuisine</p>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight">A Feast of Flavors</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Events & Festivals */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Experience Vibrant Cultural Festivals</h2>
            <p className="text-gray-600 text-lg">Immerse yourself in the colors, sounds, and traditions of the island</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {festivals.map((festival, idx) => (
              <div key={idx} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500 border border-gray-50">
                <div className="overflow-hidden h-56">
                  <img src={festival.img} alt={festival.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 text-primary group-hover:text-secondary transition-colors">{festival.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{festival.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 relative bg-cover bg-center" style={{ backgroundImage: `url(${images.mission})` }}>
        <div className="absolute inset-0 bg-primary/90 backdrop-blur-md"></div>
        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cta to-white">Our Mission</h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 font-light leading-relaxed">
            To provide travelers with an authentic, seamless, and memorable experience of Sri Lanka while supporting local communities and preserving our natural and cultural heritage.
          </p>
          <div className="flex justify-center gap-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Heart className="text-cta" size={32} />
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Globe className="text-cta" size={32} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;