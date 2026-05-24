import React from 'react';
import { Compass, Heart, Users, Globe, Home, Map } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-cream overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-white py-32 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=1600)' }}>
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-cta drop-shadow-lg">Discover SerendiGo</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light tracking-wide text-gray-200">Your trusted companion for experiencing the beauty, culture, and soul of Sri Lanka</p>
        </div>
      </section>

      {/* Sri Lanka History & Culture */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 leading-tight">The Pearl of the Indian Ocean</h2>
            <p className="text-gray-700 leading-relaxed text-lg">Sri Lanka, known as "Serendib" and "Ceylon" in ancient times, is an island nation with over 3,000 years of recorded history. From the ancient kingdoms of Anuradhapura and Polonnaruwa to the colonial era of Portuguese, Dutch, and British rule, Sri Lanka's history is a tapestry of diverse cultural influences.</p>
            <p className="text-gray-700 leading-relaxed text-lg">The country is home to eight UNESCO World Heritage Sites, including the sacred city of Kandy, the golden temple of Dambulla, the ancient city of Sigiriya, and the old town of Galle and its fortifications.</p>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-cta">
              <p className="text-primary font-semibold italic text-lg">"Sri Lankan culture is rich with traditions, world-famous Ceylon tea, aromatic spices, and warm hospitality."</p>
            </div>
          </div>
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition duration-500 z-10"></div>
            <img src="https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=800" alt="Sigiriya Rock Fortress" className="w-full h-[500px] object-cover transform group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cream to-white opacity-50 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">How SerendiGo Helps You Plan Your Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Compass, title: 'Tour Packages', desc: 'Curated cultural, wildlife, and adventure tours across Sri Lanka' },
              { icon: Home, title: 'Hotels & Stays', desc: 'Hand-picked hotels from budget to luxury stays' },
              { icon: Map, title: 'Vehicle Rentals', desc: 'Scooters, cars, and vans for independent exploration' },
              { icon: Users, title: 'Expert Guides', desc: 'Certified local guides for authentic experiences' },
            ].map((feature, idx) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group rounded-3xl overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition duration-500 z-10"></div>
            <img src="https://images.unsplash.com/photo-1604262608472-86a7d447f4c8?w=800" alt="Sri Lankan Cuisine" className="w-full h-[500px] object-cover transform group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary mb-4 leading-tight">Culinary Delights of Sri Lanka</h2>
            <p className="text-gray-700 leading-relaxed text-lg">Sri Lankan cuisine is one of the most vibrant and flavorful in the world. From the famous rice and curry to kottu roti, hoppers, and seafood delicacies, the island offers an unforgettable gastronomic journey.</p>
            <p className="text-gray-700 leading-relaxed text-lg">Don't miss the chance to taste authentic Ceylon tea, fresh tropical fruits, and traditional sweets like wattalappam and kavum during your visit.</p>
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
            {[
              { img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Kandy_Esala_Perahera_Elephant.jpg', title: 'Kandy Esala Perahera', desc: 'One of the oldest and grandest of all Buddhist festivals in Sri Lanka, featuring dancers, jugglers, musicians, fire-breathers, and lavishly decorated elephants. It pays homage to the Sacred Tooth Relic of Buddha.' },
              { img: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Vesak_Lanterns_in_Colombo.jpg', title: 'Vesak Festival', desc: 'Celebrated in May, Vesak marks the birth, enlightenment, and passing away of Lord Buddha. The entire country is illuminated with colorful lanterns and intricate pandals.' },
              { img: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Sinhala_Hindu_New_Year.jpg', title: 'Sinhala & Tamil New Year', desc: 'Celebrated in April, this festival marks the end of the harvest season. It\'s a time of traditional games, sweetmeats, and cultural unity across the island.' },
            ].map((festival, idx) => (
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
      <section className="py-24 relative bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=1600)' }}>
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