import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
}

const PageHeader = ({ title, description, className }: PageHeaderProps) => {
  return (
    <div className={`mb-8 md:mb-12 text-center ${className}`}>
      <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-3 animate-slide-up [animation-delay:0.1s]">
        {title}
      </h1>
      {description && (
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto animate-slide-up [animation-delay:0.2s]">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
