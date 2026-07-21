interface PageHeaderProps {
  icon: string;
  title: string;
  description: string;
}

export function PageHeader({ icon, title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        <div className="page-header-icon">{icon}</div>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </header>
  );
}
