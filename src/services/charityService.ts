import { createClient } from "@/utils/supabase/client";

const supabase = createClient();


export interface Charity {
  id: number;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  category: string;
  community_support: string;
  collective_impact: string;
  lives_impacted: string;
  funds_allocated: string;
  schools_modernized: string;
  raised_amount: number;
  goal_amount: number;
  featured: boolean;
  events?: CharityEvent[];
}

export interface CharityEvent {
  id: string;
  charity_id: number;
  title: string;
  event_date: string;
  event_month: string;
  location: string;
}

export const charityService = {
  async getCharities(): Promise<Charity[]> {
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        // Handle missing table error gracefully
        if (error.code === 'PGRST205') {
          console.warn('Charities table not found in Supabase. Falling back to local data.');
          return FALLBACK_CHARITIES;
        }
        console.error('Error fetching charities:', error);
        return FALLBACK_CHARITIES;
      }
      
      return data && data.length > 0 ? data : FALLBACK_CHARITIES;
    } catch (e) {
      return FALLBACK_CHARITIES;
    }
  },

  async getCharityById(id: string | number): Promise<Charity | null> {
    try {
      const { data: charity, error: charityError } = await supabase
        .from('charities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (charityError) {
        if (charityError.code === 'PGRST205' || charityError.code === 'PGRST116') {
          return FALLBACK_CHARITIES.find(c => c.id === Number(id)) || null;
        }
        console.error('Error fetching charity:', charityError);
        return null;
      }

      // Fetch events for this charity
      const { data: events, error: eventsError } = await supabase
        .from('charity_events')
        .select('*')
        .eq('charity_id', id);
      
      if (eventsError) {
        console.error('Error fetching charity events:', eventsError);
      }

      return {
        ...charity,
        events: events || []
      };
    } catch (e) {
      return FALLBACK_CHARITIES.find(c => c.id === Number(id)) || null;
    }
  },


  async getCharityEvents(charityId: number | string): Promise<CharityEvent[]> {
    const { data, error } = await supabase
      .from('charity_events')
      .select('*')
      .eq('charity_id', charityId);
    
    if (error) {
      console.error('Error fetching charity events:', error);
      return [];
    }
    return data || [];
  },

  async createCharity(charity: Partial<Charity>): Promise<Charity | null> {
    const { id, ...charityData } = charity;
    
    // Ensure numeric fields are numbers and provide default image
    const finalData = {
      ...charityData,
      image_url: charityData.image_url || "/images/charity/global_education.png",
      raised_amount: Number(charityData.raised_amount) || 0,
      goal_amount: Number(charityData.goal_amount) || 0,

      featured: Boolean(charityData.featured),
      // Default strings for impact metrics if missing
      community_support: charityData.community_support || "$0",
      collective_impact: charityData.collective_impact || "+0%",
      lives_impacted: charityData.lives_impacted || "0",
      funds_allocated: charityData.funds_allocated || "$0",
      schools_modernized: charityData.schools_modernized || "0"
    };

    const { data, error } = await supabase
      .from('charities')
      .insert([finalData])
      .select();
    
    if (error) {
      console.error('SUPABASE_ERROR during charity creation:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }
    return data ? data[0] : null;
  },



  async updateCharity(id: number | string, charity: Partial<Charity>): Promise<Charity | null> {
    const { data, error } = await supabase
      .from('charities')
      .update(charity)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating charity:', error);
      return null;
    }
    return data;
  },

  async deleteCharity(id: number | string): Promise<boolean> {
    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting charity:', error);
      return false;
    }
    return true;
  }
};


const FALLBACK_CHARITIES: Charity[] = [
  {
    id: 1,
    name: "Global Education Fund",
    tagline: "Education Initiative",
    description: "The Global Education Fund is dedicated to bridging the educational divide by equipping under-resourced schools with state-of-the-art technology and modern learning environments.",
    image_url: "/images/charity/global_education.png",
    category: "Learning",
    community_support: "$1.2M",
    collective_impact: "+24%",
    lives_impacted: "15,000+",
    funds_allocated: "$1.2M",
    schools_modernized: "42",
    raised_amount: 1200000,
    goal_amount: 2000000,
    featured: true,
    events: [
      { id: "e1", charity_id: 1, title: "Charity Pro-Am Invitational", event_date: "12", event_month: "OCT", location: "Pebble Beach" },
      { id: "e2", charity_id: 1, title: "Global Classroom Virtual Drive", event_date: "24", event_month: "NOV", location: "Online Event" }
    ]
  }
];

