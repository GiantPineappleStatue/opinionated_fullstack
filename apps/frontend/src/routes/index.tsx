import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRef, useState, useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const irisLightRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle the iris light effect that follows mouse across all cards
  useEffect(() => {
    const cardContainer = cardContainerRef.current;
    const irisLight = irisLightRef.current;
    
    if (!cardContainer || !irisLight) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = cardContainer.getBoundingClientRect();
      
      // Calculate mouse position relative to the card container
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      
      // Update mouse position state
      setMousePosition({ x, y });
      
      // Position the iris light at the mouse position
      irisLight.style.left = `${x}px`;
      irisLight.style.top = `${y}px`;
      irisLight.style.opacity = '1';
    };
    
    const handleMouseLeave = () => {
      irisLight.style.opacity = '0';
    };
    
    cardContainer.addEventListener('mousemove', handleMouseMove);
    cardContainer.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cardContainer.removeEventListener('mousemove', handleMouseMove);
      cardContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-white"
      style={{
        backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}
    >
      <div className="container mx-auto px-4 py-20">
        {/* Hero section */}
        <div className="text-center mb-24 space-y-8">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-indigo-200 bg-indigo-50">
            <span className="text-sm font-medium text-indigo-900">Full-Stack Boilerplate v1.0</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Space-Grade
            </span>{' '}
            <span className="text-gray-900">Stack</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-[800px] mx-auto">
            Launch your next project at warp speed with our modern tech stack
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg">
              <Link to="/login">Launch Mission 🚀</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 border-indigo-200 text-indigo-800 bg-white hover:bg-indigo-50 hover:text-indigo-900">
              <Link to="/register">Join the Crew</Link>
            </Button>
          </div>
        </div>

        {/* Card grid with the iris light effect */}
        <div ref={cardContainerRef} className="card-container-wrapper relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Iris light effect that follows mouse */}
          <div ref={irisLightRef} className="iris-light"></div>
          
          {/* About Card */}
          <div className="card-container">
            <div className="card-premium h-full">
              <div className="p-6 card-premium-content">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Purpose</h3>
                <p className="text-gray-700 mb-4">
                  A modern, space-themed full-stack boilerplate designed to accelerate development with cutting-edge technologies and best practices.
                </p>
                <ul className="mt-4 space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Type-safe end-to-end</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>Authentication system</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                    <span>Error handling & monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tech Stack Card */}
          <div className="card-container">
            <div className="card-premium h-full">
              <div className="p-6 card-premium-content">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Technology</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Frontend</p>
                    <p className="text-gray-700">React, TanStack Router, Shadcn UI, React Hook Form, TanStack Query</p>
                  </div>
                  <Separator className="bg-gray-200 my-1" />
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Backend</p>
                    <p className="text-gray-700">NestJS, FastAPI, JWT Auth, OpenAPI</p>
                  </div>
                  <Separator className="bg-gray-200 my-1" />
                  <div>
                    <p className="text-sm font-medium text-pink-600 mb-1">Infrastructure</p>
                    <p className="text-gray-700">Docker, Kubernetes, RabbitMQ, Redis, MySQL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="card-container">
            <div className="card-premium h-full">
              <div className="p-6 card-premium-content">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Getting Started</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Test the authentication flow by following these steps:
                  </p>
                  <ol className="space-y-3 text-gray-700 list-decimal pl-5">
                    <li className="pl-1">Click the "Launch Mission" button</li>
                    <li className="pl-1">Login with:</li>
                    <div className="ml-1 p-3 bg-indigo-50 rounded-md border border-indigo-100 font-mono text-sm">
                      <div>Email: <span className="text-indigo-700">test@test.com</span></div>
                      <div>Password: <span className="text-indigo-700">test</span></div>
                    </div>
                    <li className="pl-1">Explore the protected dashboard</li>
                    <li className="pl-1">Visit your profile page</li>
                    <li className="pl-1">Log out when finished</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 