// components/SeasonalPage.tsx

'use client';

import React from 'react';
import Image from 'next/image';
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

interface SeasonalTheme {
  name: string;
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  bannerImage: string;
  animation: React.ComponentType;
  texts: {
    mainTitle: string;
    mainSubtitle: string;
    whatIsTitle: string;
    whatIsP1: string;
    whatIsP2: string;
  };
}

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
      title: 'Seasonal Promotions',
      description: 'Curated deals and holiday sales.',
    },
    {
      icon: Ticket,
      title: 'Exclusive Vouchers',
      description: 'Unique discounts only available here.',
    },
    {
      icon: Package,
      title: 'Themed Collections',
      description: 'Find the perfect gifts in curated lists.',
    },
    {
      icon: Sparkles,
      title: 'Virtual Events',
      description: 'Join giveaways, workshops, and more.',
    },
  ];

  const businessBenefits = [
    {
      icon: Target,
      title: 'Boost Visibility',
      text: 'Get featured in our hub with thousands of consumers.',
    },
    {
      icon: Rocket,
      title: 'Drive Sales',
      text: 'Launch seasonal offers, vouchers, and campaigns instantly.',
    },
    {
      icon: Wand2,
      title: 'Easy Setup',
      text: 'Use ready-made templates & tools to go live in minutes.',
    },
  ];

  const consumerBenefits = (image: string) => [
    {
      icon: Gift,
      title: 'Discover Gifts & Deals',
      text: 'Perfect discounts for the holidays and beyond.',
      image,
    },
    {
      icon: HeartHandshake,
      title: 'Support Local',
      text: 'Find and shop from nearby businesses in your community.',
      image,
    },
    {
      icon: Trophy,
      title: 'Exclusive Rewards',
      text: 'Collect loyalty points and redeem special offers across partners.',
      image,
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
      title: 'Choose a Package',
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
      title: 'Browse the Marketplace',
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

export default function SeasonalPage({ theme }: { theme: SeasonalTheme }) {
    const Animation = theme.animation;
  return (
    <div className={`${theme.bgColor} text-white font-sans`}>
      {/* 1. Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={theme.bannerImage}
          alt={`${theme.name} banner`}
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-50"
          priority
        />
        <Animation />
        <div className={`absolute inset-0 bg-gradient-to-t from-${theme.bgColor} via-${theme.bgColor}/60 to-transparent z-10`}></div>
        <motion.div
          className="relative z-20 p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
            {theme.texts.mainTitle}
          </h1>
          <p className={`mt-4 max-w-3xl mx-auto text-lg md:text-xl text-${theme.textColor} drop-shadow-md`}>
            {theme.texts.mainSubtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className={`bg-${theme.primaryColor} hover:bg-${theme.primaryColor}/90 text-white font-bold text-lg px-8 py-6`}
            >
              Join the {theme.name} Exhibition
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`text-white border-${theme.secondaryColor} bg-transparent hover:bg-white hover:text-${theme.primaryColor} transition-colors duration-300 font-bold text-lg px-8 py-6`}
            >
              Discover {theme.name} Deals
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 2. What It Means Section */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}`}>
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className={`text-4xl font-bold text-${theme.primaryColor} mb-6`}
            >
              {theme.texts.whatIsTitle}
            </motion.h2>
            <motion.div
              variants={itemVariants}
              className={`space-y-4 text-${theme.textColor}/80 text-lg leading-relaxed`}
            >
              <p>{theme.texts.whatIsP1}</p>
              <p>{theme.texts.whatIsP2}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <HeartHandshake className={`w-8 h-8 text-${theme.primaryColor}`} />{' '}
                <span className="font-semibold text-lg">
                  Seasonal Connection
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Store className={`w-8 h-8 text-${theme.primaryColor}`} />{' '}
                <span className="font-semibold text-lg">
                  Digital Marketplace
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Users className={`w-8 h-8 text-${theme.primaryColor}`} />{' '}
                <span className="font-semibold text-lg">
                  Community Engagement
                </span>
              </div>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className={`mt-10 text-xl font-bold italic text-${theme.secondaryColor}`}
            >
              “Your {theme.name.toLowerCase()}, your marketplace — always online, always rewarding.”
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="h-80 lg:h-full rounded-xl overflow-hidden"
          >
            <Image
              src={theme.bannerImage}
              alt="Digital marketplace illustration"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. What We're Offering Section */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}/50`}>
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What We’re Offering</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {offeringCards.map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`${theme.bgColor} border-${theme.primaryColor}/50 text-white h-full hover:border-${theme.primaryColor} hover:scale-105 transition-all duration-300`}>
                  <CardHeader className="items-center">
                    <div className={`${theme.bgColor}/80 p-4 rounded-full mb-4`}>
                      <card.icon className={`w-8 h-8 text-${theme.primaryColor}`} />
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${theme.textColor}/70`}>{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-16">
            <h3 className="text-3xl font-bold mb-6">
              See Past Exhibitions in Action
            </h3>
            <div className={`w-full max-w-4xl mx-auto aspect-video ${theme.bgColor}/80 rounded-lg border border-${theme.primaryColor}/50 flex items-center justify-center`}>
              <p className={`${theme.textColor}/70`}>
                Video player component for past exhibitions would be embedded
                here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Benefits for Business Owners */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}`}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Benefits for Business Owners
          </h2>
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
            <div className={`absolute top-1/2 left-0 w-full h-0.5 bg-${theme.primaryColor}/50 hidden md:block`}></div>
            <div className={`absolute top-0 left-1/2 w-0.5 h-full bg-${theme.primaryColor}/50 md:hidden`}></div>
            {businessBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="relative z-10 flex flex-col items-center text-center max-w-xs"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className={`flex items-center justify-center w-20 h-20 ${theme.bgColor}/80 border-2 border-${theme.primaryColor} rounded-full mb-4`}>
                  <benefit.icon className={`w-10 h-10 text-${theme.primaryColor}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                <p className={`${theme.textColor}/80`}>{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Benefits for Consumers */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}/50`}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Benefits for Consumers
          </h2>
          <Carousel
            opts={{ align: 'start' }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {consumerBenefits(theme.bannerImage).map((benefit, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className={`overflow-hidden ${theme.bgColor} border-${theme.bgColor}/80`}>
                      <Image
                        src={benefit.image}
                        alt={benefit.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <benefit.icon className={`w-6 h-6 text-${theme.primaryColor}`} />{' '}
                          {benefit.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`${theme.textColor}/80`}>{benefit.text}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={`text-white bg-${theme.bgColor}/80 border-${theme.primaryColor} hover:bg-${theme.bgColor}`} />
            <CarouselNext className={`text-white bg-${theme.bgColor}/80 border-${theme.primaryColor} hover:bg-${theme.bgColor}`} />
          </Carousel>
        </div>
      </section>

      {/* 6. How to Join (Business Owners) */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}`}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How to Join as a Business
          </h2>
          <div className="relative max-w-2xl mx-auto">
            <div className={`absolute left-6 md:left-1/2 top-0 h-full w-1 bg-${theme.primaryColor}/50 transform md:-translate-x-1/2`}></div>
            {businessSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative pl-16 md:pl-0 mb-12"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div
                  className={`flex items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  <div className="absolute left-6 md:left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={`flex items-center justify-center w-12 h-12 ${theme.bgColor}/80 border-2 border-${theme.primaryColor} rounded-full`}>
                      <step.icon className={`w-6 h-6 text-${theme.primaryColor}`} />
                    </div>
                  </div>
                  <div
                    className={`w-full md:w-5/12 p-6 ${theme.bgColor}/80 rounded-lg border border-${theme.primaryColor}/50`}
                  >
                    <h3 className={`font-bold text-xl text-${theme.primaryColor} mb-2`}>
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className={`${theme.textColor}/80`}>{step.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              className={`bg-${theme.primaryColor} hover:bg-${theme.primaryColor}/90 text-white font-bold text-lg px-8 py-6`}
            >
              Join as a Business
            </Button>
          </div>
        </div>
      </section>

      {/* 7. How to Join (Consumers) */}
      <section className={`py-20 px-6 md:px-12 ${theme.bgColor}/50`}>
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
                  <step.icon className={`w-16 h-16 text-${theme.primaryColor}`} />
                  <div className={`absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-${theme.primaryColor} rounded-full font-bold text-white border-2 border-${theme.bgColor}`}>
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className={`${theme.textColor}/70`}>{step.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className={`text-white border-${theme.secondaryColor} bg-transparent hover:bg-white hover:text-${theme.primaryColor} transition-colors duration-300 font-bold text-lg px-8 py-6`}
            >
              Start Exploring Deals
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Closing Section */}
      <section className="relative py-24 px-6 text-center">
        <Image
          src={theme.bannerImage}
          alt={`${theme.name} landscape`}
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-40"
        />
        <div className={`absolute inset-0 ${theme.bgColor}/70 z-10`}></div>
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto">
            Make This {theme.name} Unforgettable with MCOM
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className={`bg-${theme.primaryColor} hover:bg-${theme.primaryColor}/90 text-white font-bold text-lg px-8 py-6`}
            >
              Showcase Your Business
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`text-white border-${theme.secondaryColor} bg-transparent hover:bg-white hover:text-${theme.primaryColor} transition-colors duration-300 font-bold text-lg px-8 py-6`}
            >
              Discover Offers
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
