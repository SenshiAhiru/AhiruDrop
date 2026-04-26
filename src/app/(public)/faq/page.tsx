"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/provider";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

const FAQ_PT: FaqSection[] = [
  {
    title: "Sobre a plataforma",
    items: [
      {
        question: "O que é o AhiruDrop?",
        answer:
          "O AhiruDrop é uma plataforma brasileira de rifas online de skins de Counter-Strike 2 (CS2). Você compra números com AhiruCoins (AHC), aguarda o sorteio — que é 100% verificável via blockchain do Bitcoin — e se ganhar, recebe a skin direto no seu inventário da Steam.",
      },
      {
        question: "Preciso ter conta Steam pra participar?",
        answer:
          "Pra jogar rifas, basta criar conta por e-mail. Mas pra receber a skin se ganhar, você precisa de conta Steam e de uma Steam Trade URL válida (configurável no seu perfil). Se preferir, pode se cadastrar já vinculando sua Steam na tela de login.",
      },
    ],
  },
  {
    title: "AhiruCoins (AHC)",
    items: [
      {
        question: "O que é AhiruCoin (AHC)?",
        answer:
          "AHC é a moeda interna do AhiruDrop, pegada ao dólar com taxa fixa: 1 AHC = $1 USD. Quando você deposita em reais, o sistema converte usando o câmbio ao vivo (USD→BRL atualizado em tempo real). Você usa AHC pra comprar números em qualquer rifa. O saldo não expira.",
      },
      {
        question: "Como faço um depósito?",
        answer:
          "No dashboard, vai em Depositar AHC. Escolhe a moeda (BRL ou USD), a quantidade de AHC e paga via cartão de crédito pelo Stripe — o pagamento é processado em segundos. O saldo é creditado automaticamente assim que o cartão é aprovado.",
      },
      {
        question: "Quais formas de pagamento são aceitas?",
        answer:
          "Hoje aceitamos cartão de crédito via Stripe. Outros métodos (incluindo PIX via Mercado Pago) estão no roadmap e devem chegar em breve.",
      },
      {
        question: "Posso sacar AHC de volta pra reais?",
        answer:
          "Não. AHC é saldo de plataforma — serve exclusivamente pra participar das rifas. Depósitos não geram reembolso automático em dinheiro. Em casos específicos de erro de cobrança, abra um ticket no suporte.",
      },
    ],
  },
  {
    title: "Cupons de bônus",
    items: [
      {
        question: "Como funciona o cupom?",
        answer:
          "Cupons são aplicados no momento do depósito e dão AHC bônus em cima do valor pago. Você paga o valor cheio na moeda escolhida e recebe AHC extra além do que comprou. Exemplo: depósito de 100 AHC ($100 USD) com cupom de 10% — você paga o equivalente a $100 (em BRL ou USD) e recebe 110 AHC (100 base + 10 de bônus).",
      },
      {
        question: "Onde encontro cupons?",
        answer:
          "Cupons são divulgados pelas nossas redes sociais, campanhas por e-mail, parceiros e streamers. Fica de olho! Alguns são de uso único por usuário, outros têm limite total e podem esgotar.",
      },
      {
        question: "Posso acumular vários cupons?",
        answer:
          "Não. Apenas um cupom por depósito. Se o cupom tem limite por usuário (ex: 1 por conta), ele não pode ser reaplicado depois de resgatado.",
      },
    ],
  },
  {
    title: "Comprando números",
    items: [
      {
        question: "Como compro números em uma rifa?",
        answer:
          "Entra na página da rifa, seleciona os números manualmente (clicando no grid) ou gera 5/10 aleatórios, e clica em Comprar. O valor é debitado direto do seu saldo AHC e os números ficam seus na hora — sem janela de reserva, sem pagamento externo.",
      },
      {
        question: "Tem limite de números por compra?",
        answer:
          "Sim. Cada rifa define um máximo por compra (tipicamente 10 números). Você pode fazer mais de uma compra na mesma rifa, respeitando a disponibilidade dos números.",
      },
      {
        question: "E se o saldo não for suficiente?",
        answer:
          "O botão de comprar fica desabilitado. É só ir na tela de Depositar AHC, adicionar mais saldo e voltar — seus números selecionados não ficam presos.",
      },
    ],
  },
  {
    title: "Sorteio — Provably Fair",
    items: [
      {
        question: "O sorteio é realmente justo?",
        answer:
          "Sim, e verificável. Usamos commit-reveal ancorado na blockchain do Bitcoin: antes da rifa começar, publicamos o SHA-256 de um server seed secreto + a altura do bloco BTC que vai servir de âncora. Quando o sorteio acontece, revelamos o server seed original e usamos o hash do bloco BTC daquela altura pra derivar o número vencedor via HMAC-SHA256. Qualquer pessoa pode recomputar e conferir.",
      },
      {
        question: "Como verifico um sorteio específico?",
        answer:
          "Toda rifa sorteada tem uma página pública de verificação (acessível pelo link Verificar na própria rifa) que mostra todos os insumos — server seed, block hash, altura do bloco e fórmula — com o cálculo passo-a-passo. Você pode recomputar manualmente com qualquer ferramenta SHA-256.",
      },
      {
        question: "Quando o sorteio acontece?",
        answer:
          "Depende de cada rifa. Pode ser por data agendada, quando atingir um percentual de vendas, ou quando todos os números forem comprados. A informação fica visível na página da rifa. O sistema só libera o sorteio após o bloco-âncora do Bitcoin ser minerado.",
      },
    ],
  },
  {
    title: "Ganhei — e agora?",
    items: [
      {
        question: "Como sei se ganhei?",
        answer:
          "Se seu número foi sorteado, um popup de celebração aparece na sua próxima visita ao site. Além disso, a vitória fica registrada em Minhas Vitórias no dashboard, com notificação in-app. E-mail automático de vitória está no roadmap.",
      },
      {
        question: "Como recebo a skin?",
        answer:
          "Em Minhas Vitórias, você informa sua Steam Trade URL (pode pegar em steamcommunity.com/id/SEU_USER/tradeoffers/privacy). Nossa equipe envia a trade offer pra você; você confirma no Steam Mobile Authenticator e aceita. A skin cai no seu inventário.",
      },
      {
        question: "Quanto tempo leva pra receber a skin?",
        answer:
          "Depende de dois fatores: a skin pode ter trade hold de até 7 dias (regra da Valve pra itens recém-adquiridos) e nossa equipe envia as trades em horário comercial. O status fica visível em tempo real no dashboard: Pendente → Enviado → Entregue.",
      },
      {
        question: "Onde consigo minha Steam Trade URL?",
        answer:
          "Logado na Steam, acesse steamcommunity.com/id/SEU_USER/tradeoffers/privacy, copie a URL completa (formato https://steamcommunity.com/tradeoffer/new/?partner=XXX&token=XXX) e cole no seu perfil ou direto em Minhas Vitórias.",
      },
    ],
  },
  {
    title: "Reembolso e cancelamento",
    items: [
      {
        question: "Posso cancelar uma compra?",
        answer:
          "Compras feitas com saldo AHC são confirmadas na hora e não têm cancelamento automático pelo usuário. Em casos específicos (erro, cobrança em duplicidade, etc.), nosso suporte pode fazer reembolso manual: o AHC volta pro seu saldo e os números são liberados pra outros.",
      },
      {
        question: "E o depósito em reais?",
        answer:
          "Depósitos via cartão seguem a política da Stripe. Se houver erro de cobrança, contata o suporte que avaliamos caso a caso. Depósitos efetivamente creditados em AHC não são reembolsáveis em dinheiro — viram saldo de plataforma.",
      },
    ],
  },
  {
    title: "Segurança",
    items: [
      {
        question: "Meus dados estão seguros?",
        answer:
          "Sim. Senhas são hasheadas com bcrypt, tokens de sessão são JWT assinados, pagamentos passam pelo Stripe (nunca armazenamos dados de cartão) e toda comunicação é HTTPS. Seguimos boas práticas da LGPD pros dados pessoais.",
      },
      {
        question: "Como protegem contra bot / abuso?",
        answer:
          "Temos CAPTCHA opcional (Cloudflare Turnstile) no cadastro/login, rate-limiting nas rotas de pagamento e detecção de múltiplas contas por IP que alerta nosso time.",
      },
      {
        question: "Preciso ser maior de idade?",
        answer:
          "Sim, 18 anos completos. Ao se cadastrar você declara atender esse requisito. Jogos de sorte são proibidos pra menores no Brasil.",
      },
    ],
  },
  {
    title: "Suporte",
    items: [
      {
        question: "Como entro em contato?",
        answer:
          "Abre um ticket pelo dashboard em Suporte — é o caminho mais rápido e fica registrado no seu histórico. Também respondemos em suporte@ahirudrop.com.",
      },
      {
        question: "Qual o horário de atendimento?",
        answer:
          "Segunda a sexta, das 9h às 18h (horário de Brasília). Fora desse horário você pode abrir o ticket normalmente e respondemos assim que voltarmos.",
      },
    ],
  },
];

const FAQ_EN: FaqSection[] = [
  {
    title: "About the platform",
    items: [
      {
        question: "What is AhiruDrop?",
        answer:
          "AhiruDrop is a Brazilian online platform for Counter-Strike 2 (CS2) skin raffles. You buy numbers with AhiruCoins (AHC), wait for the draw — which is 100% verifiable via the Bitcoin blockchain — and if you win, the skin is delivered straight to your Steam inventory.",
      },
      {
        question: "Do I need a Steam account to join?",
        answer:
          "To enter raffles you only need an email account. To receive the skin after winning, you need a Steam account with a valid Steam Trade URL (configurable in your profile). You can also sign up linking Steam directly on the login page.",
      },
    ],
  },
  {
    title: "AhiruCoins (AHC)",
    items: [
      {
        question: "What is AhiruCoin (AHC)?",
        answer:
          "AHC is AhiruDrop's internal currency, pegged 1:1 to the US dollar (1 AHC = $1 USD). When you deposit in BRL, the system converts using the live USD→BRL rate at the moment of payment. You use AHC to buy numbers in any raffle. The balance never expires.",
      },
      {
        question: "How do I deposit?",
        answer:
          "On the dashboard, go to Deposit AHC. Pick a currency (BRL or USD), the AHC amount and pay with a credit card via Stripe — processed in seconds. The balance is credited automatically as soon as the card is approved.",
      },
      {
        question: "Which payment methods are accepted?",
        answer:
          "Today we accept credit card via Stripe. Other methods (including PIX via Mercado Pago) are on the roadmap and coming soon.",
      },
      {
        question: "Can I withdraw AHC back to cash?",
        answer:
          "No. AHC is platform balance — used exclusively to join raffles. Deposits are not auto-refundable to cash. For billing errors, open a support ticket.",
      },
    ],
  },
  {
    title: "Bonus coupons",
    items: [
      {
        question: "How do coupons work?",
        answer:
          "Coupons apply at deposit time and grant bonus AHC on top of the amount you pay. You pay the full price; you receive extra AHC. Example: a $100 deposit with a 10% coupon = you pay $100 and receive 110 AHC (100 base + 10 bonus).",
      },
      {
        question: "Where do I find coupons?",
        answer:
          "Coupons are shared on our social channels, email campaigns, partners and streamers. Keep an eye out! Some are one-use per user; others have a global cap and can run out.",
      },
      {
        question: "Can I stack multiple coupons?",
        answer:
          "No — only one coupon per deposit. If a coupon has a per-user limit (e.g. 1 per account), it can't be reapplied once redeemed.",
      },
    ],
  },
  {
    title: "Buying numbers",
    items: [
      {
        question: "How do I buy numbers in a raffle?",
        answer:
          "On the raffle page, pick numbers manually (click on the grid) or roll 5/10 random, then click Buy. The amount is debited from your AHC balance and the numbers are yours immediately — no reservation window, no external payment.",
      },
      {
        question: "Is there a limit per purchase?",
        answer:
          "Yes. Each raffle defines a maximum per purchase (typically 10 numbers). You can make multiple purchases in the same raffle, subject to number availability.",
      },
      {
        question: "What if my balance isn't enough?",
        answer:
          "The Buy button is disabled. Just hit Deposit AHC, top up and come back — your selected numbers aren't locked.",
      },
    ],
  },
  {
    title: "Draw — Provably Fair",
    items: [
      {
        question: "Is the draw really fair?",
        answer:
          "Yes, and verifiable. We use commit-reveal anchored on the Bitcoin blockchain: before the raffle starts, we publish the SHA-256 of a secret server seed + the BTC block height to be used as anchor. When the draw happens, we reveal the original server seed and combine it with the BTC block hash at that height via HMAC-SHA256 to derive the winning number. Anyone can recompute and verify.",
      },
      {
        question: "How do I verify a specific draw?",
        answer:
          "Every drawn raffle has a public verification page (reachable via the Verify link on the raffle) showing all inputs — server seed, block hash, block height and formula — with the step-by-step math. You can recompute manually with any SHA-256 tool.",
      },
      {
        question: "When does the draw happen?",
        answer:
          "Depends on the raffle — it can be a scheduled date, a sales threshold, or when all numbers sell out. It's shown on the raffle page. The system only allows drawing after the anchor Bitcoin block has been mined.",
      },
    ],
  },
  {
    title: "I won — now what?",
    items: [
      {
        question: "How do I know if I won?",
        answer:
          "If your number was drawn, a celebration popup appears on your next visit. The win is also logged in My Wins in the dashboard with an in-app notification. Email notifications for winners are on the roadmap.",
      },
      {
        question: "How do I receive the skin?",
        answer:
          "In My Wins, submit your Steam Trade URL (grab it from steamcommunity.com/id/YOUR_USER/tradeoffers/privacy). Our team sends the trade offer to you; you confirm on the Steam Mobile Authenticator and accept. The skin lands in your inventory.",
      },
      {
        question: "How long does it take to receive the skin?",
        answer:
          "Two factors: the skin may have a trade hold of up to 7 days (Valve's rule for recently acquired items), and our team sends trades during business hours. Status is visible in real-time on the dashboard: Pending → Sent → Delivered.",
      },
      {
        question: "Where do I get my Steam Trade URL?",
        answer:
          "Logged into Steam, visit steamcommunity.com/id/YOUR_USER/tradeoffers/privacy, copy the full URL (format https://steamcommunity.com/tradeoffer/new/?partner=XXX&token=XXX) and paste into your profile or directly in My Wins.",
      },
    ],
  },
  {
    title: "Refunds and cancellation",
    items: [
      {
        question: "Can I cancel a purchase?",
        answer:
          "Purchases with AHC balance are confirmed instantly and don't support user-initiated cancellation. In specific cases (errors, duplicate charges, etc.), support can process a manual refund: AHC returns to your balance and the numbers are released for others.",
      },
      {
        question: "What about the actual cash deposit?",
        answer:
          "Card deposits follow Stripe's policy. For billing issues, contact support and we'll evaluate case by case. Deposits already credited as AHC are not refundable to cash — they stay as platform balance.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        question: "Is my data safe?",
        answer:
          "Yes. Passwords are hashed with bcrypt, session tokens are signed JWTs, payments go through Stripe (we never store card data) and all communication is HTTPS. We follow LGPD best practices for personal data.",
      },
      {
        question: "How do you protect against bots / abuse?",
        answer:
          "Optional CAPTCHA (Cloudflare Turnstile) on sign up/login, rate-limiting on payment routes, and multi-account detection per IP that alerts our team.",
      },
      {
        question: "Do I need to be of legal age?",
        answer:
          "Yes, 18+. By signing up you declare you meet that requirement. Games of chance are prohibited for minors in Brazil.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        question: "How do I get in touch?",
        answer:
          "Open a ticket from the dashboard in Support — fastest path and recorded in your history. We also reply at suporte@ahirudrop.com.",
      },
      {
        question: "What are your support hours?",
        answer:
          "Monday to Friday, 9am to 6pm (Brasília time). Outside those hours you can still open a ticket and we reply as soon as we're back.",
      },
    ],
  },
];

export default function FaqPage() {
  const { t, locale } = useTranslation();
  const FAQ = locale === "en" ? FAQ_EN : FAQ_PT;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          {t("faq.title")}
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          {t("faq.subtitle")}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {FAQ.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary-400">
              {section.title}
            </h2>
            <div className="space-y-0 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
              {section.items.map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[var(--foreground)] transition-colors hover:text-primary-500 [&::-webkit-details-marker]:hidden">
                    <span className="text-base font-semibold">{item.question}</span>
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-[var(--muted-foreground)]">
          {t("faq.notFoundCopy")}
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-400 transition-colors"
        >
          {t("faq.contactSupport")}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
