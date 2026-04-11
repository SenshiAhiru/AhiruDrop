export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
        Termos de Uso
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        Ultima atualizacao: 10 de abril de 2026
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            1. Aceitacao dos Termos
          </h2>
          <p>
            Ao acessar e utilizar a plataforma AhiruDrop, voce concorda com estes Termos de Uso
            em sua totalidade. Caso nao concorde com qualquer clausula, nao utilize nossos
            servicos. O uso continuado da plataforma constitui aceitacao de eventuais
            atualizacoes destes termos.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            2. Cadastro
          </h2>
          <p>
            Para participar das rifas, e necessario criar uma conta fornecendo informacoes
            verdadeiras e completas. Voce e responsavel por manter a confidencialidade de suas
            credenciais de acesso. E obrigatorio ser maior de 18 anos para se cadastrar e
            participar. Contas com informacoes falsas podem ser suspensas ou encerradas.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            3. Rifas e Participacao
          </h2>
          <p>
            Cada rifa possui regras proprias, incluindo quantidade de numeros, valor por numero,
            data de sorteio e premio oferecido. Ao adquirir numeros em uma rifa, voce aceita as
            regras especificas daquela rifa. A participacao e pessoal e intransferivel. A
            plataforma reserva o direito de cancelar rifas que nao atinjam o numero minimo de
            participantes, realizando o reembolso integral dos valores pagos.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            4. Pagamentos
          </h2>
          <p>
            Os pagamentos sao processados por meio de provedores de pagamento terceirizados. A
            confirmacao do pagamento vincula os numeros selecionados a sua conta. Uma vez
            confirmado, o pagamento nao e passivel de reembolso, exceto em caso de
            cancelamento da rifa pela plataforma. Eventuais taxas bancarias sao de
            responsabilidade do participante.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            5. Sorteios
          </h2>
          <p>
            Os sorteios sao realizados de forma automatizada, utilizando algoritmos
            criptograficos verificaveis. Cada sorteio gera um hash publico que pode ser
            auditado por qualquer pessoa. O resultado e definitivo e irrevogavel apos a
            publicacao. A plataforma nao se responsabiliza por problemas de conectividade do
            participante durante a realizacao do sorteio.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            6. Responsabilidades
          </h2>
          <p>
            A plataforma AhiruDrop atua como intermediaria entre organizadores e participantes.
            Nao nos responsabilizamos por problemas de entrega de premios causados por
            informacoes incorretas fornecidas pelo participante. E responsabilidade do
            participante verificar sua conexao, dados cadastrais e acompanhar os resultados
            dos sorteios.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            7. Privacidade
          </h2>
          <p>
            Seus dados pessoais sao tratados em conformidade com a Lei Geral de Protecao de
            Dados (LGPD). Coletamos apenas as informacoes necessarias para o funcionamento da
            plataforma. Nao compartilhamos dados pessoais com terceiros sem seu consentimento,
            exceto quando exigido por lei. Para mais detalhes, consulte nossa Politica de
            Privacidade.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
            8. Contato
          </h2>
          <p>
            Para duvidas, sugestoes ou reclamacoes sobre estes Termos de Uso, entre em contato
            pelo e-mail{" "}
            <a
              href="mailto:suporte@ahirudrop.com"
              className="text-primary-500 hover:underline"
            >
              suporte@ahirudrop.com
            </a>{" "}
            ou pela nossa pagina de{" "}
            <a href="/contact" className="text-primary-500 hover:underline">
              Contato
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
