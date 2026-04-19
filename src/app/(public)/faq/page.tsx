import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

const FAQ: FaqSection[] = [
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
          "AHC é a moeda interna do AhiruDrop. A taxa é fixa: 1 BRL = 1 AHC. Você deposita reais, recebe AHC no saldo e usa AHC pra comprar números em qualquer rifa. O saldo não expira.",
      },
      {
        question: "Como faço um depósito?",
        answer:
          "No dashboard, vai em Depositar AHC. Escolhe a moeda (BRL, USD, EUR ou GBP), a quantidade de AHC e paga via cartão de crédito pelo Stripe — o pagamento é processado em segundos. O saldo é creditado automaticamente assim que o cartão é aprovado.",
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
          "Cupons são aplicados no momento do depósito e dão AHC bônus em cima do valor pago. Você paga o valor cheio em reais, e recebe AHC extra. Exemplo: depósito de R$ 100 com cupom LUPECK de 10% = você paga R$ 100 e recebe 110 AHC (100 base + 10 de bônus).",
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
          "Toda rifa sorteada tem uma página pública em /raffles/[slug]/verify que mostra todos os insumos (server seed, block hash, altura do bloco, fórmula) e o cálculo passo-a-passo. Você pode recomputar manualmente com qualquer ferramenta SHA-256.",
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

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          Perguntas Frequentes
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Tudo sobre rifas, AHC, cupons, entrega de skins e segurança.
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
          Não encontrou o que procurava?
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-400 transition-colors"
        >
          Fale com nosso suporte
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
