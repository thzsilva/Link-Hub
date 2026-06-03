import { LegalLayout } from "@/components/legal/LegalLayout";

export default function TermsOfUse() {
  return (
    <LegalLayout title="Termos de Uso" updated="3 de junho de 2026">
      <p>
        Estes Termos de Uso ("Termos") regem o acesso e a utilização da plataforma
        <strong> hubvoid</strong> ("serviço", "nós"). Ao criar uma conta ou utilizar o serviço, você
        ("usuário") declara que leu, compreendeu e concorda integralmente com estes Termos. Caso não
        concorde, não utilize a plataforma.
      </p>

      <h2>1. Descrição do serviço</h2>
      <p>
        O hubvoid é uma plataforma de <em>link-in-bio</em> / press kit que permite ao usuário criar um
        perfil público com links, fotos, vídeos, eventos, players de música e informações de contato,
        acessível por meio de um endereço único.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras, precisas e atualizadas.</li>
        <li>Você é responsável por manter a confidencialidade das suas credenciais de acesso.</li>
        <li>Você é responsável por toda atividade realizada na sua conta.</li>
        <li>É necessário ter capacidade legal para aceitar estes Termos.</li>
      </ul>

      <h2>3. Conteúdo do usuário</h2>
      <p>
        Você é o <strong>único responsável</strong> por todo o conteúdo que publica (textos, imagens,
        vídeos, links, logos, marcas e dados de contato). Ao publicar conteúdo, você declara e garante
        que:
      </p>
      <ul>
        <li>Possui todos os direitos, licenças e autorizações necessárias sobre o conteúdo;</li>
        <li>O conteúdo não viola direitos de terceiros (autorais, marcários, de imagem, privacidade);</li>
        <li>O conteúdo não é ilegal, difamatório, ofensivo, fraudulento ou enganoso.</li>
      </ul>
      <p>
        Você mantém a titularidade do seu conteúdo e nos concede uma licença limitada, não exclusiva,
        para hospedar e exibir esse conteúdo com a finalidade de operar o serviço.
      </p>

      <h2>4. Condutas proibidas</h2>
      <p>É vedado utilizar o hubvoid para:</p>
      <ul>
        <li>Publicar conteúdo ilegal, fraudulento, discriminatório, violento ou que incite ódio;</li>
        <li>Violar direitos de propriedade intelectual ou de terceiros;</li>
        <li>Distribuir malware, spam, phishing ou esquemas fraudulentos;</li>
        <li>Tentar acessar indevidamente sistemas, contas de terceiros ou dados restritos;</li>
        <li>Sobrecarregar, prejudicar ou interferir no funcionamento da plataforma;</li>
        <li>Burlar mecanismos de segurança ou limites de uso.</li>
      </ul>

      <h2>5. Propriedade intelectual</h2>
      <p>
        A plataforma, sua marca, design, código e funcionalidades são de titularidade do hubvoid e
        protegidos por lei. Estes Termos não concedem a você qualquer direito sobre a marca ou o
        software, exceto a licença de uso do serviço conforme aqui descrito.
      </p>

      <h2>6. Disponibilidade e alterações do serviço</h2>
      <p>
        O serviço é fornecido <strong>"no estado em que se encontra"</strong> ("as is"). Podemos
        modificar, suspender ou descontinuar funcionalidades a qualquer momento, com ou sem aviso
        prévio. Não garantimos disponibilidade ininterrupta ou ausência de erros.
      </p>

      <h2>7. Isenção de garantias</h2>
      <p>
        Na máxima extensão permitida pela lei, o hubvoid não oferece garantias de que o serviço
        atenderá a todas as suas expectativas, estará livre de falhas ou que o conteúdo de terceiros
        (incluindo perfis de outros usuários) seja preciso, legal ou apropriado.
      </p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei aplicável, o hubvoid não será responsável por danos
        indiretos, incidentais, lucros cessantes, perda de dados ou danos decorrentes do uso ou da
        impossibilidade de uso do serviço, nem por conteúdo publicado por usuários. O serviço é uma
        ferramenta de publicação; a responsabilidade pelo conteúdo é exclusiva de quem o publica.
      </p>

      <h2>9. Indenização</h2>
      <p>
        Você concorda em isentar e indenizar o hubvoid por quaisquer reclamações, perdas ou despesas
        (incluindo honorários advocatícios) decorrentes do seu conteúdo, do seu uso do serviço ou da
        violação destes Termos ou de direitos de terceiros.
      </p>

      <h2>10. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos ou a legislação, a nosso critério
        razoável. Você pode encerrar sua conta a qualquer momento. O encerramento pode implicar a
        exclusão do seu conteúdo e dados, observada a Política de Privacidade.
      </p>

      <h2>11. Privacidade</h2>
      <p>
        O tratamento de dados pessoais é regido pela nossa{" "}
        <a href="/privacidade">Política de Privacidade</a>, que faz parte integrante destes Termos.
      </p>

      <h2>12. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da <strong>República Federativa do Brasil</strong>. Fica
        eleito o foro da comarca do domicílio do usuário para dirimir eventuais controvérsias, salvo
        disposição legal em contrário.
      </p>

      <h2>13. Alterações dos Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. A data da última atualização consta no topo
        desta página. O uso continuado do serviço após alterações representa concordância com os novos
        Termos.
      </p>

      <h2>14. Contato</h2>
      <p>
        Dúvidas sobre estes Termos? Entre em contato pelo e-mail:
        <strong> contato@hubvoid.com</strong>.
      </p>

      <hr />
      <p className="text-sm">
        <em>
          Aviso: este documento é um modelo informativo e não constitui aconselhamento jurídico.
          Recomenda-se a revisão por um advogado para adequação ao seu caso específico.
        </em>
      </p>
    </LegalLayout>
  );
}
