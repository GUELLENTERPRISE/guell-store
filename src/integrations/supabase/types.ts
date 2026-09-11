export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          company: string | null
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          street_line_1: string
          street_line_2: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city: string
          company?: string | null
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          street_line_1: string
          street_line_2?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          street_line_1?: string
          street_line_2?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brand_sections: {
        Row: {
          background_color: string | null
          button_text: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_path: string | null
          is_active: boolean | null
          search_category: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          button_text?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          search_category?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          button_text?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          search_category?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      browsing_history: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "browsing_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          background_color: string | null
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean | null
          name: string
        }
        Insert: {
          background_color?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name: string
        }
        Update: {
          background_color?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          claimed_quantity: number | null
          created_at: string | null
          deal_type: string
          discount_percentage: number
          end_time: string
          id: string
          is_active: boolean | null
          max_quantity: number | null
          product_id: string | null
          start_time: string
        }
        Insert: {
          claimed_quantity?: number | null
          created_at?: string | null
          deal_type: string
          discount_percentage: number
          end_time: string
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          product_id?: string | null
          start_time: string
        }
        Update: {
          claimed_quantity?: number | null
          created_at?: string | null
          deal_type?: string
          discount_percentage?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          product_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          auto_rotate_interval: number | null
          background_color: string | null
          button_link: string | null
          button_text: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_path: string | null
          is_active: boolean | null
          product_ids: string[] | null
          show_products: boolean | null
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          auto_rotate_interval?: number | null
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          product_ids?: string[] | null
          show_products?: boolean | null
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          auto_rotate_interval?: number | null
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          product_ids?: string[] | null
          show_products?: boolean | null
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_tiles: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_path: string | null
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          order_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string
          delivered_at: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string
          order_number: string
          payment_method: Json | null
          promo_code_id: string | null
          shipping_address: Json
          shipping_amount: number | null
          status: string
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address: Json
          created_at?: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          order_number: string
          payment_method?: Json | null
          promo_code_id?: string | null
          shipping_address: Json
          shipping_amount?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json
          created_at?: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string
          payment_method?: Json | null
          promo_code_id?: string | null
          shipping_address?: Json
          shipping_amount?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_answers: {
        Row: {
          answer: string
          created_at: string
          helpful_count: number | null
          id: string
          is_seller: boolean | null
          question_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_seller?: boolean | null
          question_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_seller?: boolean | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "product_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_questions: {
        Row: {
          created_at: string
          id: string
          product_id: string
          question: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          question: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_options: {
        Row: {
          created_at: string
          id: string
          inventory: number
          price_adjustment: number | null
          product_id: string
          sku: string | null
          updated_at: string
          variant_values: Json
        }
        Insert: {
          created_at?: string
          id?: string
          inventory?: number
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          updated_at?: string
          variant_values?: Json
        }
        Update: {
          created_at?: string
          id?: string
          inventory?: number
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          updated_at?: string
          variant_values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          options: Json
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          options?: Json
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          options?: Json
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          fabric_type: string | null
          id: string
          image_alt_text: string[] | null
          images: string[] | null
          inventory: number
          is_featured: boolean | null
          is_guell_plus: boolean | null
          is_prime: boolean | null
          monthly_sold_count: number | null
          name: string
          origin: string | null
          original_price: number | null
          price: number
          rating: number | null
          recommended_uses: string[] | null
          review_count: number | null
          shipped_from: string | null
          slug: string | null
          sold_by: string | null
          specifications: Json | null
          updated_at: string
          videos: string[] | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          fabric_type?: string | null
          id?: string
          image_alt_text?: string[] | null
          images?: string[] | null
          inventory?: number
          is_featured?: boolean | null
          is_guell_plus?: boolean | null
          is_prime?: boolean | null
          monthly_sold_count?: number | null
          name: string
          origin?: string | null
          original_price?: number | null
          price: number
          rating?: number | null
          recommended_uses?: string[] | null
          review_count?: number | null
          shipped_from?: string | null
          slug?: string | null
          sold_by?: string | null
          specifications?: Json | null
          updated_at?: string
          videos?: string[] | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          fabric_type?: string | null
          id?: string
          image_alt_text?: string[] | null
          images?: string[] | null
          inventory?: number
          is_featured?: boolean | null
          is_guell_plus?: boolean | null
          is_prime?: boolean | null
          monthly_sold_count?: number | null
          name?: string
          origin?: string | null
          original_price?: number | null
          price?: number
          rating?: number | null
          recommended_uses?: string[] | null
          review_count?: number | null
          shipped_from?: string | null
          slug?: string | null
          sold_by?: string | null
          specifications?: Json | null
          updated_at?: string
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_used: boolean
          max_uses: number | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_used?: boolean
          max_uses?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_used?: boolean
          max_uses?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      promotional_blocks: {
        Row: {
          background_color: string | null
          created_at: string
          display_order: number | null
          id: string
          image_path: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          helpful_count: number | null
          id: string
          images: string[] | null
          product_id: string
          rating: number
          title: string
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          product_id: string
          rating: number
          title: string
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          product_id?: string
          rating?: number
          title?: string
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          category_filter: string | null
          clicked_result_id: string | null
          clicked_result_position: number | null
          created_at: string
          filters_applied: Json | null
          id: string
          ip_address: unknown
          results_count: number
          search_duration_ms: number | null
          search_query: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category_filter?: string | null
          clicked_result_id?: string | null
          clicked_result_position?: number | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown
          results_count?: number
          search_duration_ms?: number | null
          search_query: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category_filter?: string | null
          clicked_result_id?: string | null
          clicked_result_position?: number | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown
          results_count?: number
          search_duration_ms?: number | null
          search_query?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          base_cost: number
          created_at: string
          description: string | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          base_cost?: number
          created_at?: string
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          base_cost?: number
          created_at?: string
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      shipping_settings: {
        Row: {
          created_at: string
          id: string
          shipped_from: string
          sold_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          shipped_from?: string
          sold_by?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          shipped_from?: string
          sold_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      storefront_settings: {
        Row: {
          cart_payment_icons: string[] | null
          cart_trust_badges: string[] | null
          cart_urgency_banner_text: string | null
          created_at: string | null
          enable_urgency_messaging: boolean | null
          exit_intent_button_text: string | null
          exit_intent_enabled: boolean | null
          exit_intent_message: string | null
          exit_intent_offer: string | null
          exit_intent_title: string | null
          free_shipping_threshold: number | null
          id: string
          low_stock_threshold_default: number | null
          payment_methods: string[] | null
          primary_cta_color: string | null
          primary_cta_label: string | null
          show_fast_shipping_badge_default: boolean | null
          show_satisfaction_badge_default: boolean | null
          show_secure_payment_badge_default: boolean | null
          updated_at: string | null
          verified_stores: string[] | null
        }
        Insert: {
          cart_payment_icons?: string[] | null
          cart_trust_badges?: string[] | null
          cart_urgency_banner_text?: string | null
          created_at?: string | null
          enable_urgency_messaging?: boolean | null
          exit_intent_button_text?: string | null
          exit_intent_enabled?: boolean | null
          exit_intent_message?: string | null
          exit_intent_offer?: string | null
          exit_intent_title?: string | null
          free_shipping_threshold?: number | null
          id?: string
          low_stock_threshold_default?: number | null
          payment_methods?: string[] | null
          primary_cta_color?: string | null
          primary_cta_label?: string | null
          show_fast_shipping_badge_default?: boolean | null
          show_satisfaction_badge_default?: boolean | null
          show_secure_payment_badge_default?: boolean | null
          updated_at?: string | null
          verified_stores?: string[] | null
        }
        Update: {
          cart_payment_icons?: string[] | null
          cart_trust_badges?: string[] | null
          cart_urgency_banner_text?: string | null
          created_at?: string | null
          enable_urgency_messaging?: boolean | null
          exit_intent_button_text?: string | null
          exit_intent_enabled?: boolean | null
          exit_intent_message?: string | null
          exit_intent_offer?: string | null
          exit_intent_title?: string | null
          free_shipping_threshold?: number | null
          id?: string
          low_stock_threshold_default?: number | null
          payment_methods?: string[] | null
          primary_cta_color?: string | null
          primary_cta_label?: string | null
          show_fast_shipping_badge_default?: boolean | null
          show_satisfaction_badge_default?: boolean | null
          show_secure_payment_badge_default?: boolean | null
          updated_at?: string | null
          verified_stores?: string[] | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_orders: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          frequency: string
          id: string
          is_active: boolean | null
          next_delivery_date: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_delivery_date: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_delivery_date?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tableflow_order_items: {
        Row: {
          created_at: string
          food_item_id: string | null
          id: string
          item_image: string | null
          item_name: string
          line_total: number
          merchant_id: string
          modifiers: Json
          order_id: string
          quantity: number
          special_instructions: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          food_item_id?: string | null
          id?: string
          item_image?: string | null
          item_name: string
          line_total?: number
          merchant_id: string
          modifiers?: Json
          order_id: string
          quantity: number
          special_instructions?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          food_item_id?: string | null
          id?: string
          item_image?: string | null
          item_name?: string
          line_total?: number
          merchant_id?: string
          modifiers?: Json
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          unit_price?: number
        }
        Relationships: []
      }
      tableflow_orders: {
        Row: {
          created_at: string
          guest_id: string
          guest_name: string | null
          id: string
          items: Json
          local_order_id: string
          merchant_id: string
          payment_choice: string
          session_id: string | null
          status: string
          submitted_at: string
          subtotal: number
          table_id: string
          table_number: string
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          guest_name?: string | null
          id?: string
          items?: Json
          local_order_id: string
          merchant_id: string
          payment_choice: string
          session_id?: string | null
          status?: string
          submitted_at?: string
          subtotal?: number
          table_id: string
          table_number: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          guest_name?: string | null
          id?: string
          items?: Json
          local_order_id?: string
          merchant_id?: string
          payment_choice?: string
          session_id?: string | null
          status?: string
          submitted_at?: string
          subtotal?: number
          table_id?: string
          table_number?: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tableflow_orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tableflow_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tableflow_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tableflow_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tableflow_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          merchant_id: string
          order_id: string
          paid_at: string | null
          paid_by_guest_id: string | null
          provider: string | null
          provider_reference: string | null
          status: Database["public"]["Enums"]["tableflow_payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          merchant_id: string
          order_id: string
          paid_at?: string | null
          paid_by_guest_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["tableflow_payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          merchant_id?: string
          order_id?: string
          paid_at?: string | null
          paid_by_guest_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["tableflow_payment_status"]
        }
        Relationships: []
      }
      tableflow_sessions: {
        Row: {
          created_at: string
          guest_id: string
          guest_name: string | null
          id: string
          merchant_id: string
          status: string
          table_id: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          guest_name?: string | null
          id?: string
          merchant_id: string
          status?: string
          table_id: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          guest_name?: string | null
          id?: string
          merchant_id?: string
          status?: string
          table_id?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tableflow_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tableflow_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tableflow_tables: {
        Row: {
          created_at: string
          id: string
          merchant_id: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          country: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          rate: number
          state: string | null
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          rate: number
          state?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rate?: number
          state?: string | null
        }
        Relationships: []
      }
      terms_and_conditions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          last_updated: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          addresses: Json | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_prime_member: boolean | null
          phone: string | null
          preferences: Json | null
          prime_expires_at: string | null
          updated_at: string
        }
        Insert: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_prime_member?: boolean | null
          phone?: string | null
          preferences?: Json | null
          prime_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_prime_member?: boolean | null
          phone?: string | null
          preferences?: Json | null
          prime_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_shares: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          share_token: string
          wishlist_owner_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          share_token: string
          wishlist_owner_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          share_token?: string
          wishlist_owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      popular_searches: {
        Row: {
          avg_results: number | null
          last_searched: string | null
          search_count: number | null
          search_query: string | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_share_token: { Args: never; Returns: string }
      get_user_notifications: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          data: Json
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }[]
      }
      increment_promo_code_usage: {
        Args: { p_promo_code_id: string; p_user_id: string }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
      upsert_user_subscription: {
        Args: {
          p_stripe_customer_id?: string
          p_subscribed?: boolean
          p_subscription_end?: string
          p_subscription_tier?: string
        }
        Returns: string
      }
      validate_promo_code: {
        Args: { code_input: string }
        Returns: {
          code: string
          current_uses: number
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          max_uses: number
        }[]
      }
    }
    Enums: {
      tableflow_kitchen_status: "new" | "preparing" | "ready" | "served"
      tableflow_payment_choice: "now" | "later"
      tableflow_payment_status: "pending" | "paid" | "failed" | "refunded"
      tableflow_session_status: "draft" | "confirmed" | "closed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tableflow_kitchen_status: ["new", "preparing", "ready", "served"],
      tableflow_payment_choice: ["now", "later"],
      tableflow_payment_status: ["pending", "paid", "failed", "refunded"],
      tableflow_session_status: ["draft", "confirmed", "closed", "cancelled"],
    },
  },
} as const
