import React from 'react';
import { Heart, Shield, Users, Sparkles, Award, Globe } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

const MissionSection: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Co-Founder',
      image: 'https://api.dicebear.com/7.x/professional/svg?seed=sarah&backgroundColor=c0aede',
      bio: 'Former clinical psychologist with 15 years of experience in mental health technology.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      image: 'https://api.dicebear.com/7.x/professional/svg?seed=michael&backgroundColor=b6e3f4',
      bio: 'AI researcher and engineer passionate about making healthcare more accessible.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Clinical Operations',
      image: 'https://api.dicebear.com/7.x/professional/svg?seed=emily&backgroundColor=ffd5dc',
      bio: 'Licensed therapist dedicated to improving documentation workflows for providers.'
    },
    {
      name: 'David Kim',
      role: 'Head of Security',
      image: 'https://api.dicebear.com/7.x/professional/svg?seed=david&backgroundColor=d0f0c0',
      bio: 'Cybersecurity expert ensuring HIPAA compliance and data protection.'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Patient-Centered Care',
      description: 'Every feature we build starts with improving patient outcomes and provider efficiency.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'We maintain the highest standards of data security and HIPAA compliance.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Empowering Providers',
      description: 'We believe technology should enhance, not replace, the human connection in healthcare.'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI to transform healthcare documentation.'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize healthcare documentation, giving providers more time 
            to focus on what matters most: their patients. By combining AI technology with clinical expertise, 
            we're building the future of mental health care.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
            <p className="text-gray-600 mb-4">
              DocuHero was born from a simple observation: healthcare providers were spending more time 
              on paperwork than with patients. Our founders, having experienced this firsthand, knew there 
              had to be a better way.
            </p>
            <p className="text-gray-600 mb-4">
              In 2021, we brought together a team of clinicians, AI researchers, and healthcare technology 
              experts with a shared vision: to create tools that would give providers their time back while 
              ensuring the highest standards of documentation and compliance.
            </p>
            <p className="text-gray-600">
              Today, we're proud to serve thousands of mental health professionals across the country, 
              helping them deliver better care through smarter documentation.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-indigo-600">10,000+</p>
                <p className="text-gray-600 mt-2">Providers Served</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-indigo-600">2M+</p>
                <p className="text-gray-600 mt-2">Hours Saved</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-indigo-600">50</p>
                <p className="text-gray-600 mt-2">States Covered</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-indigo-600">99.9%</p>
                <p className="text-gray-600 mt-2">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                  {value.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Meet Our Team</h3>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We're a diverse team of healthcare professionals, engineers, and designers united by our 
            passion for improving mental health care delivery.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-indigo-600 text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards and Recognition */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Recognition & Awards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Best Healthcare AI</p>
              <p className="text-sm text-gray-600">TechCrunch 2023</p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Top 10 Startup</p>
              <p className="text-sm text-gray-600">Forbes 2023</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">HIPAA Certified</p>
              <p className="text-sm text-gray-600">Since 2021</p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Provider's Choice</p>
              <p className="text-sm text-gray-600">Healthcare IT 2024</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Us in Transforming Healthcare</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a provider looking to streamline your practice or someone passionate about 
            improving healthcare, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              Join Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;