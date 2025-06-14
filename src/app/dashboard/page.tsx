import PageHeader from '@/components/shared/PageHeader';
import { getContactInfo } from '@/lib/data-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Instagram, MapPin, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Contact Glitzy Rides',
  description: 'Get in touch with Glitzy Rides for your luxury wedding car rental needs. Find our phone, email, Instagram, and location.',
};

export default async function DashboardPage() {
  const contactInfo = await getContactInfo();

  const contactItems = [
    { icon: Phone, label: 'Phone', value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
    { icon: Mail, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
    { icon: Instagram, label: 'Instagram', value: contactInfo.instagram, href: `https://instagram.com/${contactInfo.instagram.replace('@', '')}`, target: '_blank' },
    { icon: MapPin, label: 'Location', value: contactInfo.location },
  ];

  return (
    <div className="py-8">
      <PageHeader
        title="Get in Touch"
        description="We're here to help make your special day unforgettable. Reach out to us with any inquiries or to book your dream wedding car."
      />
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <Card className="shadow-xl animate-slide-up">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {contactItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                <item.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{item.label}</h3>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.target || '_self'}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="text-accent hover:underline flex items-center group"
                    >
                      {item.value}
                      {item.target === '_blank' && <ExternalLink className="ml-1 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                    </a>
                  ) : (
                    <p className="text-foreground/80">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="relative h-80 md:h-full min-h-[300px] rounded-lg shadow-xl overflow-hidden animate-fade-in [animation-delay:0.5s]">
           <Image
            src="https://placehold.co/800x600.png"
            alt="Luxury car interior"
            layout="fill"
            objectFit="cover"
            data-ai-hint="luxury car interior"
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
            <p className="text-white text-xl font-semibold">Let us make your journey memorable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
