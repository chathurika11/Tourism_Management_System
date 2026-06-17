import React, { useState, useEffect } from 'react';
import { Compass, Heart, Globe, Home, Map, Calendar, MapPin, Utensils, Award, Users } from 'lucide-react';
import aboutus1 from '../images/aboutus1.jpg';
import aboutus2 from '../images/aboutus2.jpg';
import aboutus3 from '../images/aboutus3.jpg';
import aboutus4 from '../images/aboutus4.jpeg';
import aboutus5 from '../images/aboutus5.jpeg';
import aboutus6 from '../images/aboutus6.jpeg';
import aboutusa from '../images/aboutusa.jpeg';
import aboutusb from '../images/aboutusb.jpeg';
import aboutusc from '../images/aboutusc.jpeg';

const heroImages = [aboutus1, aboutus2, aboutus3, aboutus4, aboutus5, aboutus6];

const images = {
  history: aboutusa,
  cuisine: aboutusc,
};

const festivals = [
  {
    img: 'https://media.gov.lk/images/2025/04-Kandy.jpg',
    title: 'Kandy Esala Perahera',
    desc: 'One of the oldest and grandest Buddhist festivals in Sri Lanka, featuring dancers, musicians, fire-breathers, and lavishly decorated elephants.',
    month: 'July/August',
    location: 'Kandy',
  },
  {
    img: 'https://live.staticflickr.com/4247/34886315306_ef35717579.jpg',
    title: 'Vesak Festival',
    desc: 'Celebrated in May, Vesak marks the birth, enlightenment, and passing of Lord Buddha with lanterns, lights, and intricate pandals.',
    month: 'May',
    location: 'Nationwide',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Traditional_Sri_Lankan_New_Year_Celebrations.jpg/960px-Traditional_Sri_Lankan_New_Year_Celebrations.jpg',
    title: 'Sinhala & Hindu New Year',
    desc: 'Celebrated in April, this festival marks the harvest season with traditional games, sweetmeats, and cultural unity across the island.',
    month: 'April',
    location: 'Nationwide',
  },
];

const features = [
  { icon: Compass, title: 'Tour Packages', desc: 'Curated cultural, wildlife, and adventure tours across Sri Lanka' },
  { icon: Home, title: 'Hotels & Stays', desc: 'Hand-picked hotels from budget to luxury stays' },
  { icon: Map, title: 'Vehicle Rentals', desc: 'Scooters, cars, and vans for independent exploration' },
  { icon: Users, title: 'Expert Guides', desc: 'Certified local guides for authentic experiences' },
];

const stats = [
  { value: '3,000+', label: 'Years of History', icon: Calendar },
  { value: '8', label: 'UNESCO Sites', icon: Award },
  { value: '100+', label: 'Hotels', icon: Home },
  { value: '98%', label: 'Satisfaction', icon: Heart },
];

const AboutUs = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-cream overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-white py-32 overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1 bg-cta/20 backdrop-blur-sm rounded-full text-sm mb-4 tracking-wider border border-cta/30">✦ WELCOME TO SERENDIGO ✦</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Discover SerendiGo</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light tracking-wide text-white">Your trusted companion for experiencing the beauty, culture, and soul of Sri Lanka</p>
          <div className="mt-8 flex justify-center gap-3">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentHeroIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="transform hover:scale-110 transition duration-300">
                <stat.icon className="mx-auto mb-2 text-cta" size={32} />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sri Lanka History & Culture */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
            <img src={images.history} alt="Sri Lanka Beach" className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[440px] lg:h-[500px]" />
          </div>
          <div className="space-y-6">
            <span className="text-secondary font-semibold tracking-wider uppercase">The Pearl of the Indian Ocean</span>
            <h2 className="text-4xl font-bold text-primary mb-4 leading-tight">Island of Rich Heritage</h2>
            <div className="w-20 h-1 bg-cta rounded-full"></div>
            <p className="text-gray-700 leading-relaxed text-lg">Sri Lanka, known as "Serendib" and "Ceylon" in ancient times, is an island nation with over 3,000 years of recorded history. From the ancient kingdoms of Anuradhapura and Polonnaruwa to the colonial era, Sri Lanka's history is a tapestry of diverse cultural influences.</p>
            <p className="text-gray-700 leading-relaxed text-lg">The country is home to eight UNESCO World Heritage Sites, including the sacred city of Kandy, the golden temple of Dambulla, the ancient city of Sigiriya, and the old town of Galle and its fortifications.</p>
            <div className="bg-primary/5 p-6 rounded-2xl shadow-md border-l-4 border-cta">
              <p className="text-primary font-semibold italic text-lg">"Sri Lankan culture is rich with traditions, world-famous Ceylon tea, aromatic spices, and warm hospitality."</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-secondary font-semibold tracking-wider uppercase">Our Services</span>
            <h2 className="text-4xl font-bold text-primary mt-2">How SerendiGo Helps You Plan Your Journey</h2>
            <div className="w-20 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-cream rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-gray-100">
                <div className="bg-primary/10 rounded-2xl p-5 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                  <feature.icon className="text-primary group-hover:text-white transition" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Events & Festivals */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-secondary font-semibold tracking-wider uppercase">Celebrate With Us</span>
            <h2 className="text-4xl font-bold text-primary mb-4">Experience Vibrant Cultural Festivals</h2>
            <div className="w-20 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
            <p className="text-gray-600 text-lg mt-4">Immerse yourself in the colors, sounds, and traditions of the island</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {festivals.map((festival, idx) => (
              <div key={idx} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                <div className="overflow-hidden h-56">
                  <img src={festival.img} alt={festival.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar size={14} /> {festival.month}
                    <MapPin size={14} /> {festival.location}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-primary">{festival.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{festival.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food & Culinary */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="text-secondary font-semibold tracking-wider uppercase">Taste of Paradise</span>
              <h2 className="text-4xl font-bold text-primary mb-4 flex items-center gap-2"><Utensils /> Culinary Delights of Sri Lanka</h2>
              <div className="w-20 h-1 bg-cta rounded-full"></div>
              <p className="text-gray-700 leading-relaxed text-lg">Sri Lankan cuisine is one of the most vibrant and flavorful in the world. From the famous rice and curry to kottu roti, hoppers, and seafood delicacies, the island offers an unforgettable gastronomic journey.</p>
              <p className="text-gray-700 leading-relaxed text-lg">Don't miss the chance to taste authentic Ceylon tea, fresh tropical fruits, and traditional sweets like wattalappam and kavum during your visit.</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-cream p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h4 className="font-bold text-primary">Spiced Classics</h4>
                  <p className="text-sm text-gray-600">Aromatic curries, coconut sambols</p>
                </div>
                <div className="bg-cream p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h4 className="font-bold text-primary">Local Favorites</h4>
                  <p className="text-sm text-gray-600">Hoppers, kottu, tropical fruits</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group rounded-2xl overflow-hidden shadow-2xl">
              <img src={images.cuisine} alt="Sri Lankan cuisine" className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[440px] lg:h-[500px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                <p className="text-xs uppercase tracking-wider text-cream/90 mb-1">Authentic Cuisine</p>
                <h3 className="text-2xl sm:text-3xl font-semibold">A Feast of Flavors</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${aboutusb})` }}>
        <div className="absolute inset-0 bg-primary/70"></div>
        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Mission</h2>
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