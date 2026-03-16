
const StatsSection = () => {
  const stats = [
    { number: "1013", label: "Contributors", sublabel: "Active this month" },
    { number: "474", label: "Projects", sublabel: "Open source" },
    { number: "14", label: "Countries", sublabel: "Worldwide" },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            You're in{" "}
            <span className="gradient-text">good company</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-6xl font-bold gradient-text">{stat.number}</div>
              <div className="text-xl font-semibold">{stat.label}</div>
              <div className="text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
