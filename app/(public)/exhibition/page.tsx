"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import {
  Calendar,
  Zap,
  Award,
  Users,
  ShoppingBag,
  Ticket,
  Video,
  Mic,
  Gift,
  UserCheck,
  PlusCircle,
  Eye,
  BarChart2,
  DollarSign,
  FileText,
  MousePointerClick,
  Users2,
  MessageSquare,
} from 'lucide-react';
import Footer from '@/components/Footer';

const seasonalEvents = [
  {
    season: 'Spring',
    theme: 'Growth & Innovation',
    dates: 'March 20-22, 2024',
    image: 'https://source.unsplash.com/random/800x600/?spring,growth',
    color: 'from-emerald-500 to-lime-500',
    icon: Calendar,
  },
  {
    season: 'Summer',
    theme: 'Adventure & Outdoors',
    dates: 'June 21-23, 2024',
    image: 'https://source.unsplash.com/random/800x600/?summer,adventure',
    color: 'from-rose-500 to-amber-500',
    icon: Zap,
  },
  {
    season: 'Autumn',
    theme: 'Harvest & Creativity',
    dates: 'September 22-24, 2024',
    image: 'https://source.unsplash.com/random/800x600/?autumn,harvest',
    color: 'from-orange-500 to-yellow-500',
    icon: Award,
  },
  {
    season: 'Winter',
    theme: 'Festivity & Community',
    dates: 'December 21-23, 2024',
    image: 'https://source.unsplash.com/random/800x600/?winter,community',
    color: 'from-sky-500 to-indigo-500',
    icon: Users,
  },
];

const businessBenefits = [
  {
    icon: DollarSign,
    title: 'Cost-Effective',
    text: 'Lower overheads compared to physical expos. No travel or setup costs.',
  },
  {
    icon: BarChart2,
    title: 'Wider Reach',
    text: 'Access a global audience without geographical limitations.',
  },
  {
    icon: FileText,
    title: 'Lead Generation',
    text: 'Capture valuable leads with built-in analytics and contact forms.',
  },
];

const consumerBenefits = [
  {
    icon: ShoppingBag,
    title: 'Exclusive Deals',
    text: 'Access special discounts and offers available only at the exhibition.',
    image: 'https://source.unsplash.com/random/800x800/?deals,sale',
  },
  {
    icon: Ticket,
    title: 'Convenience',
    text: 'Shop from the comfort of your home, anytime, anywhere.',
    image: 'https://source.unsplash.com/random/800x800/?home,comfort',
  },
  {
    icon: Gift,
    title: 'Discover New Brands',
    text: 'Find unique products and innovative services from emerging businesses.',
    image: 'https://source.unsplash.com/random/800x800/?discovery,product',
  },
];

const businessSteps = [
  {
    icon: UserCheck,
    title: 'Sign Up',
    text: 'Create your MCOM Mall account or sign in.',
  },
  {
    icon: PlusCircle,
    title: 'Build Your Booth',
    text: 'Use our easy wizard to upload your logo, banner, and products.',
  },
  {
    icon: Video,
    title: 'Schedule Demos',
    text: 'Set up live sessions to engage with your audience.',
  },
  {
    icon: Eye,
    title: 'Go Live',
    text: 'Once approved, your booth is ready for the exhibition dates.',
  },
];

const consumerSteps = [
  {
    icon: MousePointerClick,
    title: 'Browse',
    text: 'Explore a wide range of virtual booths and products.',
  },
  {
    icon: Users2,
    title: 'Engage',
    text: 'Chat with exhibitors and watch live demos.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop',
    text: 'Enjoy exclusive deals and secure checkout.',
  },
  {
    icon: MessageSquare,
    title: 'Review',
    text: 'Share your experience and help the community.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function VirtualExhibitionPage() {
  return (
    <div className="bg-emerald-950 text-white">
      {/* 1. Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-6">
        <Image
          src="https://source.unsplash.com/random/1920x1080/?exhibition,virtual,event"
          alt="Virtual Exhibition"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-emerald-950 z-10"></div>
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            MCOM Virtual Seasonal Exhibition
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-stone-300">
            Discover, shop, and connect with unique businesses at our year-round virtual events.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/exhibition">
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-6"
              >
                Explore the Exhibition
              </Button>
            </Link>
            <Link href="/exhibitor/register">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-pink-400 bg-transparent hover:bg-white hover:text-pink-700 transition-colors duration-300 font-bold text-lg px-8 py-6"
              >
                Become an Exhibitor
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. Upcoming Seasons Section */}
      <section className="py-20 px-6 md:px-12 bg-emerald-900/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Seasonal Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {seasonalEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="relative group overflow-hidden h-[400px] bg-emerald-900 border-lime-700/50 text-white hover:border-lime-500 transition-all duration-300">
                  <Image
                    src={event.image}
                    alt={event.season}
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
                  />
                  <div
                    className={`absolute inset-0 z-10 bg-gradient-to-t ${event.color} opacity-20 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <div className="relative z-20 flex flex-col justify-between h-full p-6">
                    <div>
                      <event.icon className="w-12 h-12 text-pink-400 mb-4" />
                      <h3 className="text-3xl font-bold">{event.season}</h3>
                      <p className="text-lg text-stone-300">{event.theme}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xl">{event.dates}</p>
                      <Button
                        size="sm"
                        className="mt-4 bg-white text-emerald-800 hover:bg-lime-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Benefits for Business Owners */}
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

      {/* 4. Benefits for Consumers */}
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
                      <Image
                        src={benefit.image}
                        alt={benefit.title}
                        layout="fill"
                        objectFit="cover"
                        className="z-0 transition-transform duration-500 group-hover:scale-110"
                      />
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

      {/* 5. How to Join (Business Owners) */}
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

      {/* 6. How to Join (Consumers) */}
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

      {/* 7. Closing Section */}
      <section className="relative py-24 px-6 text-center">
        <Image
          src="https://source.unsplash.com/random/1920x1080/?business,event,community"
          alt="Business event landscape"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-40"
        />
        <div className="absolute inset-0 bg-emerald-950/70 z-10"></div>
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto">
            Join the MCOM Virtual Exhibition Today
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
