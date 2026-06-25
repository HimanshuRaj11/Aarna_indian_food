'use client'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/Components/ui/button'
import Link from 'next/link'
import { ArrowRight, FileText, Users, Package, ChartBar, Shield, Clock, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import PreLoader from '@/Components/Other/PreLoader'


export default function Page() {
  const router = useRouter()
  const { User: user, loading, error } = useSelector((state: any) => state.User)

  useEffect(() => {
    if (!loading && user) {
      router.replace('/Dashboard')
    }
  }, [user, router, loading])

  if (loading || !error) {
    return <PreLoader />
  }
  if (user) {
    return <PreLoader />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto text-center"
        >
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium inline-block mb-6">
            Trusted by businesses worldwide
          </span>
          <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Streamline Your Business with <span className="text-blue-600 relative">FyBill
              <span className="absolute bottom-0 left-0 w-full h-2 bg-blue-200 -z-10"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The all-in-one billing and invoice management solution that helps you manage your business finances with ease. Save time, reduce errors, and get paid faster.
          </p>
          <div className="flex gap-6 justify-center mb-16">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Link href="/Login" className="flex items-center">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">100%</h3>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
              <p className="text-gray-600">Customer Support</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">1</h3>
              <p className="text-gray-600">Country Served</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-lg">POWERFUL FEATURES</span>
            <h2 className="text-4xl font-bold mt-2 mb-4">Everything You Need to Manage Your Business</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to streamline your operations and boost productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-600" />}
              title="Smart Invoice Management"
              description="Create professional invoices in seconds with customizable templates and automated payment reminders."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Team Collaboration"
              description="Seamlessly manage your team, assign roles, and track performance metrics in real-time."
            />
            <FeatureCard
              icon={<Package className="h-10 w-10 text-blue-600" />}
              title="Inventory Control"
              description="Track stock levels, set reorder points, and manage your product catalog effortlessly."
            />
            <FeatureCard
              icon={<ChartBar className="h-10 w-10 text-blue-600" />}
              title="Advanced Analytics"
              description="Make data-driven decisions with comprehensive reports and visual dashboards."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-blue-600" />}
              title="Time Tracking"
              description="Monitor project hours, billable time, and employee productivity all in one place."
            />
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-blue-600" />}
              title="Multi-Currency Support"
              description="Handle international transactions with automatic currency conversion and tax calculations."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of successful businesses that trust FyBill for their invoicing and business management needs. Start your 14-day free trial today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl">
                <Link href="/Login">Start Free Trial</Link>
              </Button>

            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
  >
    <div className="mb-6 bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center">{icon}</div>
    <h3 className="text-2xl font-semibold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
)

