import FadeIn from "@/shared/components/molecules/fadeIn";

type Speaker = {
  name: string;
  role: string;
  bio?: string;
};

type SpeakerGroup = {
  heading: string;
  speakers: Speaker[];
};

const SPEAKER_GROUPS: SpeakerGroup[] = [
  {
    heading: "Chief Guest",
    speakers: [
      {
        name: "Sri Chiranjiv Choudary garu, IFS",
        role: "Principal Secretary to Government (Food Processing), Industries & Commerce Department, Govt. of AP",
        bio: "Sri Chiranjiv Choudary garu has been at the forefront of Andhra Pradesh's efforts to build a stronger food-processing ecosystem — promoting value addition, investment, farmer-linked enterprises and market opportunities. His work reflects an important shift from simply producing more to creating more value from what our farmers produce.",
      },
    ],
  },
  {
    heading: "Guests of Honour",
    speakers: [
      {
        name: "Sri Kalyan Chakravarthy",
        role: "Director (Administration), SERP",
        bio: "Serving as Director (Administration) / Standing Counsel representing SERP. He has also been involved in regional rural development administration, notably associated with District Rural Development Agency (DRDA) operations.",
      },
      {
        name: "Sri Krishna Mohan Gadiparthi garu",
        role: "Chairman, CII Visakhapatnam",
        bio: "A first-generation entrepreneur and seasoned management professional with over 28 years of leadership across IT, BPM and manufacturing. As Founder & President of Inspiredge IT Solutions, he has built a global technology enterprise serving Fortune 500 companies, and works closely with CII, NASSCOM and other industry bodies to promote technology, entrepreneurship and enterprise growth in Andhra Pradesh.",
      },
      {
        name: "Kumaraswamy garu",
        role: "Akhila Bharatiya Rojgar Pramukh, BKS (Bharath Kisan Sangh)",
      },
    ],
  },
  {
    heading: "Panel Discussion",
    speakers: [
      {
        name: "Subhash Kiran garu",
        role: "Program Director, GAME · Core Team, AgriMinds",
        bio: "Brings over 15 years of experience in rural development, enterprise promotion and livelihood creation. Through GAME's District Entrepreneurship Mission, he is working to turn local potential into scalable enterprises — including supporting agri-entrepreneurs and strengthening the entrepreneurship ecosystem in Andhra Pradesh.",
      },
      {
        name: "Samanth Kumar garu",
        role: "Deputy Director, NABARD Visakhapatnam",
        bio: "Works closely with farmer organisations, rural enterprises and grassroots institutions to strengthen livelihoods and access to finance and markets — experience that will be valuable as AgriMinds works to make farmer-led enterprises more sustainable and investment-ready.",
      },
      {
        name: "Ram Kumar Varma garu",
        role: "Founder & CEO, Native Araku Coffee",
        bio: "Has demonstrated how a farmer-first idea can be transformed into a strong value-added agri brand. His work with Araku's tribal coffee farmers and rural entrepreneurs closely reflects AgriMinds' belief that agriculture can create both successful enterprises and stronger livelihoods.",
      },
      {
        name: "Smt. B. Shyamala garu",
        role: "District Horticulture Officer, Visakhapatnam, Govt. of Andhra Pradesh",
        bio: "Works closely with farmers to promote high-value horticulture, modern technologies and market-oriented cultivation — a focus on productivity, value addition and better farmer returns that aligns strongly with AgriMinds' mission of building profitable agricultural enterprises.",
      },
    ],
  },
];

export default function LaunchEventSpeakers() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          <span className="h-px w-8 bg-current" />
          Who Joined Us
        </div>
        <h2 className="font-display mt-4 text-3xl leading-[1.1] font-semibold tracking-tight text-foreground-heading sm:text-4xl">
          Speakers & Guests
        </h2>
      </div>

      <div className="mt-12 space-y-14">
        {SPEAKER_GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-foreground-muted uppercase">{group.heading}</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {group.speakers.map((speaker, i) => (
                <FadeIn key={speaker.name} delay={i * 0.06}>
                  <div className="h-full rounded-2xl border border-border bg-surface-card p-6">
                    <p className="font-display text-lg font-semibold text-foreground-heading">{speaker.name}</p>
                    <p className="mt-1 text-sm font-medium text-accent">{speaker.role}</p>
                    {speaker.bio ? <p className="mt-3 text-sm leading-relaxed text-foreground-body">{speaker.bio}</p> : null}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
