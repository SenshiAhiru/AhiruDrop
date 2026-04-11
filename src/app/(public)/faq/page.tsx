import Link from "next/link";

const FAQ_ITEMS = [
  {
    question: "O que e o AhiruDrop?",
    answer:
      "O AhiruDrop e uma plataforma de rifas online que conecta organizadores e participantes em um ambiente seguro, transparente e moderno. Nosso objetivo e proporcionar uma experiencia premium de sorteios, com total rastreabilidade e verificacao publica dos resultados.",
  },
  {
    question: "Como funciona uma rifa?",
    answer:
      "Cada rifa possui um numero definido de cotas (numeros) disponiveis para compra. Os participantes escolhem seus numeros e realizam o pagamento. Quando todas as cotas sao vendidas ou quando a data do sorteio chega, um numero e sorteado de forma aleatoria e verificavel. O participante que possui o numero sorteado ganha o premio.",
  },
  {
    question: "Como eu compro numeros?",
    answer:
      "Acesse a pagina da rifa desejada, selecione os numeros manualmente ou gere numeros aleatorios, e clique em 'Comprar'. Voce sera direcionado para a tela de pagamento. Apos a confirmacao do pagamento, os numeros ficam vinculados a sua conta automaticamente.",
  },
  {
    question: "Quais formas de pagamento sao aceitas?",
    answer:
      "Atualmente aceitamos pagamentos via PIX, que oferece confirmacao instantanea. O PIX e o metodo mais rapido e seguro, e a confirmacao dos seus numeros acontece em poucos segundos apos o pagamento.",
  },
  {
    question: "Como sei se ganhei?",
    answer:
      "Voce sera notificado por e-mail e na propria plataforma caso seja o vencedor de um sorteio. Alem disso, todos os resultados sao publicados na pagina de resultados com total transparencia, incluindo o numero sorteado e a verificacao criptografica.",
  },
  {
    question: "O sorteio e justo?",
    answer:
      "Sim. Cada sorteio gera um hash criptografico unico utilizando um seed publico combinado com dados verificaveis. O algoritmo e aberto e qualquer pessoa pode verificar a integridade do resultado. Nao ha possibilidade de manipulacao.",
  },
  {
    question: "Posso cancelar minha compra?",
    answer:
      "Uma vez confirmado o pagamento e os numeros vinculados, nao e possivel cancelar a compra, pois os numeros ja ficam reservados para voce. Caso tenha algum problema com o pagamento, entre em contato com nosso suporte para analise.",
  },
  {
    question: "Como recebo meu premio?",
    answer:
      "Apos o sorteio, o vencedor e contatado por e-mail com instrucoes para retirada ou envio do premio. Premios fisicos podem ser enviados pelos Correios ou retirados presencialmente, dependendo da rifa. Premios digitais sao entregues diretamente na plataforma.",
  },
  {
    question: "Meus dados estao seguros?",
    answer:
      "Sim. Utilizamos criptografia em todas as comunicacoes, armazenamento seguro de dados e seguimos as melhores praticas de seguranca da informacao. Seus dados pessoais e financeiros sao tratados com total sigilo, em conformidade com a LGPD.",
  },
  {
    question: "Como entro em contato com o suporte?",
    answer:
      "Voce pode entrar em contato conosco atraves da pagina de Contato, por e-mail em suporte@ahirudrop.com ou pelas nossas redes sociais. Nosso horario de atendimento e de segunda a sexta, das 9h as 18h.",
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
          Encontre respostas para as duvidas mais comuns sobre o AhiruDrop.
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
          Nao encontrou o que procurava?
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
