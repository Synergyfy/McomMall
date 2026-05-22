// app/spring-exhibition/page.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Users,
  Store,
  HeartHandshake,
  Gift,
  Ticket,
  Package,
  Sparkles,
  Target,
  Rocket,
  Wand2,
  Trophy,
  UserPlus,
  LayoutGrid,
  ShoppingBag,
  Award,
  LogIn,
  PartyPopper,
  Palette,
} from 'lucide-react';
import Footer from '@/components/Footer';

// --- Animated Petals Overlay Component ---
const FloatingPetals = () => {
  const petalColors = ['bg-pink-300/60', 'bg-violet-300/60', 'bg-stone-100/60'];

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
      {Array.from({ length: 75 }).map((_, i) => {
        const color = petalColors[i % petalColors.length];
        const duration = Math.random() * 12 + 10; // Slower, more graceful
        const delay = Math.random() * 15;
        const initialX = Math.random() * 100;
        const sway = (Math.random() - 0.5) * 40; // Wider sway

        return (
          <motion.div
            key={i}
            className={`absolute ${color} rounded-full`}
            initial={{
              y: '-10vh',
              x: `${initialX}vw`,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: '110vh',
              x: [
                `${initialX}vw`,
                `${initialX + sway}vw`,
                `${initialX - sway}vw`,
                `${initialX}vw`,
              ],
              rotate: Math.random() * 360 + 360,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
            }}
          />
        );
      })}
    </div>
  );
};

// --- Main Page Component ---
export default function SpringExhibitionPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const offeringCards = [
    {
      icon: Gift,
      title: 'Fresh Spring Savings',
      description: 'Curated deals for a season of renewal.',
    },
    {
      icon: Ticket,
      title: 'Exclusive Vouchers',
      description: 'Unique discounts only available here.',
    },
    {
      icon: Package,
      title: 'Blooming Collections',
      description: 'Find perfect items in our curated collections.',
    },
    {
      icon: Sparkles,
      title: 'Virtual Workshops',
      description: 'Join gardening, craft workshops, and more.',
    },
  ];

  const businessBenefits = [
    {
      icon: Target,
      title: 'Boost Visibility',
      text: 'Get featured in our Spring hub with thousands of consumers.',
    },
    {
      icon: Rocket,
      title: 'Drive Sales',
      text: 'Launch seasonal offers, vouchers, and campaigns instantly.',
    },
    {
      icon: Wand2,
      title: 'Easy Setup',
      text: 'Use ready-made spring templates & tools to go live in minutes.',
    },
  ];

  const consumerBenefits = [
    {
      icon: Gift,
      title: 'Discover Gifts & Deals',
      text: 'Perfect discounts for the holidays and beyond. Explore a wide variety of products from local and international sellers, all at your fingertips.',
      image:
        'https://plus.unsplash.com/premium_photo-1721742732943-9b87ac8b1b72?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      icon: HeartHandshake,
      title: 'Support Local',
      text: 'Find and shop from nearby businesses in your community. Help small businesses thrive and discover unique, handcrafted items.',
      image:
        'https://plus.unsplash.com/premium_photo-1721742732943-9b87ac8b1b72?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      icon: Trophy,
      title: 'Exclusive Rewards',
      text: 'Collect loyalty points and redeem special offers across partners. Enjoy member-only perks, early access to sales, and personalized recommendations.',
      image:
        'https://plus.unsplash.com/premium_photo-1721742732943-9b87ac8b1b72?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      icon: Sparkles,
      title: 'Interactive Experiences',
      text: 'Participate in virtual workshops, live demos, and engaging events. Learn new skills, get inspired, and connect with creators directly.',
      image:
        'https://plus.unsplash.com/premium_photo-1721742732943-9b87ac8b1b72?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  const businessSteps = [
    {
      icon: LogIn,
      title: 'Sign Up / Claim Your Listing',
      text: 'Get started by creating or finding your business profile.',
    },
    {
      icon: Package,
      title: 'Choose Spring Package',
      text: 'Select the exhibition package that fits your goals.',
    },
    {
      icon: Palette,
      title: 'Customize with Templates',
      text: 'Easily build your seasonal campaign and offers.',
    },
    {
      icon: PartyPopper,
      title: 'Go Live in the Hub',
      text: 'Launch your booth and connect with eager customers.',
    },
  ];

  const consumerSteps = [
    {
      icon: UserPlus,
      title: 'Create Free Account',
      text: 'Sign up in seconds to unlock all features.',
    },
    {
      icon: LayoutGrid,
      title: 'Browse Spring Marketplace',
      text: 'Explore deals from hundreds of local businesses.',
    },
    {
      icon: ShoppingBag,
      title: 'Claim & Shop Deals',
      text: 'Grab vouchers and shop your favorite offers instantly.',
    },
    {
      icon: Award,
      title: 'Earn & Redeem Rewards',
      text: 'Collect points and enjoy exclusive benefits.',
    },
  ];

  const pastExhibitions = [
    { videoId: 'rokGy0huYEA', title: 'Apple Vision Pro Introduction' },
    { videoId: 'yX39J_YyKbs', title: 'Beautiful Nature Relaxation Video' },
    { videoId: '3g-yrjh58ms', title: 'What is Generative AI?' },
  ];

  return (
    <div className="bg-emerald-950 text-stone-100 font-sans">
      {/* 1. Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Spring city lights at night" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
        <FloatingPetals />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent z-10"></div>
        <motion.div
          className="relative z-20 p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Spring Virtual Exhibition
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-stone-200 drop-shadow-md">
            Celebrate the season of renewal with fresh offers, blooming events,
            and new experiences — for businesses & consumers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-6"
            >
              Join the Spring Exhibition
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-pink-400 bg-transparent hover:bg-white hover:text-pink-700 transition-colors duration-300 font-bold text-lg px-8 py-6"
            >
              Discover Spring Deals
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 2. What It Means Section */}
      <section className="py-20 px-6 md:px-12 bg-emerald-950">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-lime-300 mb-6"
            >
              What the Spring Exhibition Means
            </motion.h2>
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-stone-300 text-lg leading-relaxed"
            >
              <p>
                Spring is a season of new beginnings. Our Virtual Exhibition
                brings together businesses and consumers in a lively digital
                marketplace, designed to highlight fresh offers and campaigns
                that make the days brighter.
              </p>
              <p>
                Think of it as your online spring blossom festival, where
                businesses can launch their newest promotions, and you can
                discover, shop, and grow — all from the comfort of home.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <HeartHandshake className="w-8 h-8 text-lime-300" />{' '}
                <span className="font-semibold text-lg">
                  Seasonal Connection
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Store className="w-8 h-8 text-lime-300" />{' '}
                <span className="font-semibold text-lg">
                  Digital Marketplace
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-lime-300" />{' '}
                <span className="font-semibold text-lg">
                  Community Engagement
                </span>
              </div>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="mt-10 text-xl font-bold italic text-pink-300"
            >
              “Your spring, your marketplace — always online, always fresh.”
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="h-80 lg:h-full rounded-xl overflow-hidden"
          >
            <img src="https://images.unsplash.com/photo-1712612452350-d02d6d2dcf2a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Digital marketplace illustration" width={800} height={600} />
          </motion.div>
        </div>
      </section>

      {/* 3. What We're Offering Section */}
      <section className="py-20 px-6 md:px-12 bg-emerald-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">{`What We're Offering`}</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {offeringCards.map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-emerald-900 border-lime-700/50 text-white h-full hover:border-lime-500 hover:scale-105 transition-all duration-300">
                  <CardHeader className="items-center">
                    <div className="p-4 bg-emerald-800 rounded-full mb-4">
                      <card.icon className="w-8 h-8 text-lime-300" />
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-400">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-16">
            <h3 className="text-3xl font-bold mb-6">
              See Past Exhibitions in Action
            </h3>
            <div className="w-full max-w-4xl mx-auto">
              <Carousel>
                <CarouselContent>
                  {pastExhibitions.map((exhibition, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video p-1">
                        <iframe
                          className="w-full h-full rounded-lg border border-lime-800/50"
                          src={`https://www.youtube.com/embed/${exhibition.videoId}`}
                          title={exhibition.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-white bg-emerald-800/80 border-lime-600 hover:bg-emerald-700" />
                <CarouselNext className="text-white bg-emerald-800/80 border-lime-600 hover:bg-emerald-700" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Benefits for Business Owners */}
      <section className="py-20 px-6 md:px-12 bg-emerald-950">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-16">
            Benefits for Business Owners
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {businessBenefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-emerald-900 border-lime-700/50 text-white h-full text-center hover:border-lime-500 hover:scale-105 transition-all duration-300 flex flex-col items-center p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="p-5 bg-emerald-800 rounded-full">
                      <benefit.icon className="w-10 h-10 text-lime-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-stone-300">{benefit.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Benefits for Consumers */}
      <section className="py-20 px-6 md:px-12 bg-emerald-900/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Benefits for Consumers
          </h2>
          <Carousel
            opts={{ align: 'start' }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {consumerBenefits.map((benefit, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="relative overflow-hidden bg-stone-100 text-stone-900 border-pink-200 h-[400px] group">
                      <img src={benefit.image} alt={benefit.title} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-emerald-800/90 to-lime-600/20 transition-all duration-500 ease-in-out h-1/2 group-hover:h-full flex flex-col justify-end">
                        <div className="flex items-center gap-3 mb-2">
                          <benefit.icon className="w-8 h-8 text-lime-100" />
                          <h3 className="text-2xl font-bold text-white leading-tight">
                            {benefit.title}
                          </h3>
                        </div>
                        <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out">
                          <p className="text-lime-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            {benefit.text}
                          </p>
                          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
                            <Button
                              size="sm"
                              className="bg-lime-200 text-emerald-800 hover:bg-white"
                            >
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white bg-emerald-800 border-lime-600 hover:bg-emerald-700" />
            <CarouselNext className="text-white bg-emerald-800 border-lime-600 hover:bg-emerald-700" />
          </Carousel>
        </div>
      </section>

      {/* 6. How to Join (Business Owners) */}
      <section className="py-20 px-6 md:px-12 bg-emerald-950">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How to Join as a Business
          </h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 h-full w-1 bg-lime-800/50 transform md:-translate-x-1/2"></div>
            {businessSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative pl-16 md:pl-0 mb-12 last:mb-0"
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div
                  className={`relative flex items-center justify-between ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  <div className="md:w-5/12"></div>
                  <div className="absolute left-6 md:left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-900 border-2 border-pink-400 rounded-full">
                      <step.icon className="w-6 h-6 text-lime-300" />
                    </div>
                  </div>
                  <div className="w-full md:w-5/12 p-6 bg-emerald-900 rounded-lg border border-lime-800/50">
                    <h3 className="font-bold text-xl text-lime-300 mb-2">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-stone-300">{step.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-6"
            >
              Join as a Business
            </Button>
          </div>
        </div>
      </section>

      {/* 7. How to Join (Consumers) */}
      <section className="py-20 px-6 md:px-12 bg-emerald-900/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How to Join as a Consumer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {consumerSteps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative mb-4">
                  <step.icon className="w-16 h-16 text-lime-300" />
                  <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-pink-500 rounded-full font-bold text-white border-2 border-emerald-900">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-stone-400">{step.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-pink-400 bg-transparent hover:bg-white hover:text-pink-700 transition-colors duration-300 font-bold text-lg px-8 py-6"
            >
              Start Exploring Deals
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Closing Section */}
      <section className="relative py-24 px-6 text-center">
        <img src="https://source.unsplash.com/random/1920x1080/?spring,flowers,blossom" alt="Spring flowers landscape" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" />
        <div className="absolute inset-0 bg-emerald-950/70 z-10"></div>
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto">
            Make This Spring Unforgettable with MCOM Virtual Exhibition
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-6"
            >
              Showcase Your Business
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-pink-400 bg-transparent hover:bg-white hover:text-pink-700 transition-colors duration-300 font-bold text-lg px-8 py-6"
            >
              Discover Offers
            </Button>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
