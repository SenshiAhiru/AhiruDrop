import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
        Termos de Uso
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        Última atualização: 10 de abril de 2026
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e utilizar a plataforma AhiruDrop, você concorda com estes Termos de Uso
            em sua totalidade. Caso não concorde com qualquer cláusula, não utilize nossos
            serviços. O uso continuado da plataforma constitui aceitação de eventuais
            atualizações destes termos.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            2. Cadastro
          </h2>
          <p>
            Para participar das rifas, é necessário criar uma conta fornecendo informações
            verdadeiras e completas. Você é responsável por manter a confidencialidade de suas
            credenciais de acesso. É obrigatório ser maior de 18 anos para se cadastrar e
            participar. Contas com informações falsas podem ser suspensas ou encerradas.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            3. Rifas e Participação
          </h2>
          <p>
            Cada rifa possui regras próprias, incluindo quantidade de números, valor por número,
            data de sorteio e prêmio oferecido. Ao adquirir números em uma rifa, você aceita as
            regras específicas daquela rifa. A participação é pessoal e intransferível. A
            plataforma reserva o direito de cancelar rifas que não atinjam o número mínimo de
            participantes, realizando o reembolso integral dos valores pagos.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            4. Pagamentos
          </h2>
          <p>
            Os pagamentos são processados por meio de provedores de pagamento terceirizados. A
            confirmação do pagamento vincula os números selecionados à sua conta. Uma vez
            confirmado, o pagamento não é passível de reembolso, exceto em caso de
            cancelamento da rifa pela plataforma. Eventuais taxas bancárias são de
            responsabilidade do participante.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            5. Sorteios
          </h2>
          <p>
            Os sorteios são realizados de forma automatizada, utilizando algoritmos
            criptográficos verificáveis. Cada sorteio gera um hash público que pode ser
            auditado por qualquer pessoa. O resultado é definitivo e irrevogável após a
            publicação. A plataforma não se responsabiliza por problemas de conectividade do
            participante durante a realização do sorteio.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            6. Responsabilidades
          </h2>
          <p>
            A plataforma AhiruDrop atua como intermediária entre organizadores e participantes.
            Não nos responsabilizamos por problemas de entrega de prêmios causados por
            informações incorretas fornecidas pelo participante. É responsabilidade do
            participante verificar sua conexão, dados cadastrais e acompanhar os resultados
            dos sorteios.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            7. Privacidade
          </h2>
          <p>
            Seus dados pessoais são tratados em conformidade com a Lei Geral de Proteção de
            Dados (LGPD). Coletamos apenas as informações necessárias para o funcionamento da
            plataforma. Não compartilhamos dados pessoais com terceiros sem seu consentimento,
            exceto quando exigido por lei. Para mais detalhes, consulte nossa Política de
            Privacidade.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            8. Contato
          </h2>
          <p>
            Para dúvidas, sugestões ou reclamações sobre estes Termos de Uso, entre em contato
            pelo e-mail{" "}
            <a
              href="mailto:suporte@ahirudrop.com"
              className="text-primary-500 hover:underline"
            >
              suporte@ahirudrop.com
            </a>{" "}
            ou pela nossa página de{" "}
            <Link href="/contact" className="text-primary-500 hover:underline">
              Contato
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
