-- Create terms and conditions table
CREATE TABLE public.terms_and_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Terms and Conditions',
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Terms and conditions are viewable by everyone" 
ON public.terms_and_conditions 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin access
CREATE POLICY "Only authenticated users can manage terms" 
ON public.terms_and_conditions 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert initial terms and conditions
INSERT INTO public.terms_and_conditions (title, content, version) VALUES (
  'Terms and Conditions of Use for GÜELL',
  'Last Updated: [Date]

1. Introduction and Acceptance of Terms

Welcome to GÜELL ("the Website," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of the GÜELL website, including any content, functionality, and services offered on or through the Website.

Please read these Terms carefully before you start to use the Website. By accessing, browsing, or using the Website, you accept and agree to be bound and abide by these Terms and our Privacy Policy. If you do not agree to these Terms or the Privacy Policy, you must not access or use the Website.

2. Definitions

"User" / "You" / "Your": Any individual or entity who accesses or uses the Website.

"Customer": A User who purchases a product or service through the Website.

"Content": All text, graphics, user interfaces, visual interfaces, photographs, trademarks, logos, sounds, music, artwork, and computer code found on the Website.

"Product(s)": The goods or services offered for sale on the Website.

3. User Account Registration and Security

To access certain features of the Website, you may be required to register and create an account. You agree to:
a. Provide accurate, current, and complete information during the registration process.
b. Maintain and promptly update your account information to keep it accurate and complete.
c. Maintain the security of your password and accept all risks of unauthorized access to your account.
d. Notify us immediately of any unauthorized use of your account or any other breach of security.
e. Be responsible for all activities that occur under your account.
f. GÜELL+ Basic Membership: By completing your account registration, you automatically become a member of the basic level of the GÜELL+ program ("Basic Membership"). This Basic Membership is subject to these Terms and may provide you with benefits such as exclusive access to promotions, early sale notifications, and a personalized account dashboard.
g. Communication Consent: As part of your GÜELL+ Basic Membership, you expressly agree to receive informational communications related to the GÜELL+ program (e.g., details about benefits, membership updates, and tier advancements) via email or other contact methods provided during registration. You may manage your communication preferences or opt-out of marketing communications at any time through your account settings or by using the unsubscribe link provided in our emails.

We reserve the right to disable any user account, at any time, if in our opinion you have failed to comply with any provision of these Terms.

4. Terms of Sale

a. Product Information: We strive to display the colors and details of our Products as accurately as possible. However, the actual colors you see will depend on your monitor, and we cannot guarantee its accuracy. All descriptions of Products are subject to change at our discretion.

b. Pricing and Payment: All prices are listed in [e.g., US Dollars] and are subject to change without notice. We reserve the right to refuse or cancel any order at any time for reasons including, but not limited to, Product availability, errors in the description or price of the Product, or error in your order. You agree to pay all charges incurred by you or any users of your account.

c. Order Acceptance: Your order constitutes an offer to purchase a Product. All orders are subject to acceptance by us, and we will confirm such acceptance by sending you an email that confirms the shipment of the Product (the "Shipping Confirmation"). The contract of sale is formed only when we send the Shipping Confirmation.

5. Shipping and Delivery

Shipping times and costs are estimates and are provided on the checkout page. We are not liable for any delays in delivery that are due to causes beyond our reasonable control (e.g., carrier delays, weather, acts of God).

6. Return, Refund, and Cancellation Policy

a. Returns: We accept returns of unopened and unused items in their original packaging within [e.g., 30] days of delivery for a full refund of the product price. The customer is responsible for return shipping costs unless the return is due to our error (e.g., wrong item shipped, defective item).

b. Refunds: Once your return is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain number of business days.

c. Exchanges: We only replace items if they are defective or damaged upon receipt. To request an exchange, contact our customer service.

d. Cancellations: You may cancel an order before it has been shipped. Once a Shipping Confirmation has been sent, the order cannot be canceled.

7. Intellectual Property Rights

The Website and its entire Content, features, and functionality are owned by GÜELL, its licensors, or other providers and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, reproduce, distribute, modify, create derivative works of, publicly display, or exploit any Content without our express prior written permission.

8. Prohibited Uses

You may use the Website only for lawful purposes and in accordance with these Terms. You agree not to use the Website:

In any way that violates any applicable law or regulation.

To engage in any fraudulent or deceptive activity.

To send spam or other unsolicited commercial communications.

To transmit any viruses or malicious code.

To attempt to gain unauthorized access to any part of the Website or any related systems or networks.

9. Disclaimer of Warranties; Limitation of Liability

a. Disclaimer: THE WEBSITE AND ALL PRODUCTS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY LAW, GÜELL DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

b. Limitation of Liability: IN NO EVENT SHALL GÜELL, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE WEBSITE OR THE PRODUCTS, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE LAST SIX (6) MONTHS.

10. Indemnification

You agree to defend, indemnify, and hold harmless GÜELL, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the Website.

11. Governing Law and Jurisdiction

These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law principles. You agree to the exclusive jurisdiction of the courts located in [Your City, State/Country] to resolve any dispute.

12. Changes to the Terms

We may revise and update these Terms from time to time at our sole discretion. All changes are effective immediately when we post them. Your continued use of the Website following the posting of revised Terms means that you accept and agree to the changes.

13. Contact Information

If you have any questions about these Terms, please contact us at:
GÜELL Customer Service
Email: [Your Contact Email]
Address: [Your Physical Address]',
  '2.0'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_terms_and_conditions_updated_at
    BEFORE UPDATE ON public.terms_and_conditions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();