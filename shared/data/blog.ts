export type BlogPost = { slug: string; title: string; description: string; category: string; location: string };

export const BLOG_POSTS: BlogPost[] = [
  { slug: "market-place", title: "Market Place: Connecting Agri-Entrepreneurs with Customers", description: "Over two days at RTIH, Vizag, 23 FPOs, farmer groups, and emerging agri-food enterprises brought authentic food, wellness, and rural products directly to more than 1,500 visitors.", category: "Agri-enterprise events", location: "Vizag" },
  { slug: "launch-event", title: "Our Launch Event", description: "The beginning of the AgriMinds Ecosystem Foundation — farmers, founders, and partners coming together in Vizag. Explore the highlights, photographs, and guests who joined us to launch the movement.", category: "Chapter stories", location: "Vizag" },
];
