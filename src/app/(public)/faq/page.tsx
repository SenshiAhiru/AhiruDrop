import Link from "next/link";

const FAQ_ITEMS = [
  {
    question: "O que é o AhiruDrop?",
    answer:
      "O AhiruDrop é uma plataforma de rifas online que conecta organizadores e participantes em um ambiente seguro, transparente e moderno. Nosso objetivo é proporcionar uma experiência premium de sorteios, com total rastreabilidade e verificação pública dos resultados.",
  },
  {
    question: "Como funciona uma rifa?",
    answer:
      "Cada rifa possui um número definido de cotas (números) disponíveis para compra. Os participantes escolhem seus números e realizam o pagamento. Quando todas as cotas são vendidas ou quando a data do sorteio chega, um número é sorteado de forma aleatória e verificável. O participante que possui o número sorteado ganha o prêmio.",
  },
  {
    question: "Como eu compro números?",
    answer:
      "Acesse a página da rifa desejada, selecione os números manualmente ou gere números aleatórios, e clique em 'Comprar'. Você será direcionado para a tela de pagamento. Após a confirmação do pagamento, os números ficam vinculados à sua conta automaticamente.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Atualmente aceitamos pagamentos via PIX, que oferece confirmação instantânea. O PIX é o método mais rápido e seguro, e a confirmação dos seus números acontece em poucos segundos após o pagamento.",
  },
  {
    question: "Como sei se ganhei?",
    answer:
      "Você será notificado por e-mail e na própria plataforma caso seja o vencedor de um sorteio. Além disso, todos os resultados são publicados na página de resultados com total transparência, incluindo o número sorteado e a verificação criptográfica.",
  },
  {
    question: "O sorteio é justo?",
    answer:
      "Sim. Cada sorteio gera um hash criptográfico único utilizando um seed público combinado com dados verificáveis. O algoritmo é aberto e qualquer pessoa pode verificar a integridade do resultado. Não há possibilidade de manipulação.",
  },
  {
    question: "Posso cancelar minha compra?",
    answer:
      "Uma vez confirmado o pagamento e os números vinculados, não é possível cancelar a compra, pois os números já ficam reservados para você. Caso tenha algum problema com o pagamento, entre em contato com nosso suporte para análise.",
  },
  {
    question: "Como recebo meu prêmio?",
    answer:
      "Após o sorteio, o vencedor é contatado por e-mail com instruções para retirada ou envio do prêmio. Prêmios físicos podem ser enviados pelos Correios ou retirados presencialmente, dependendo da rifa. Prêmios digitais são entregues diretamente na plataforma.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia em todas as comunicações, armazenamento seguro de dados e seguimos as melhores práticas de segurança da informação. Seus dados pessoais e financeiros são tratados com total sigilo, em conformidade com a LGPD.",
  },
  {
    question: "Como entro em contato com o suporte?",
    answer:
      "Você pode entrar em contato conosco através da página de Contato, por e-mail em suporte@ahirudrop.com ou pelas nossas redes sociais. Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
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
          Encontre respostas para as dúvidas mais comuns sobre o AhiruDrop.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-0 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {FAQ_ITEMS.map((item, i) => (
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

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-[var(--muted-foreground)]">
          Não encontrou o que procurava?
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-400 transition-colors"
        >
          Entre em contato com nosso suporte
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
