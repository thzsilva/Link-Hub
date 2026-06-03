import { LegalLayout } from "@/components/legal/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Política de Privacidade" updated="3 de junho de 2026">
      <p>
        Esta Política de Privacidade descreve como o <strong>hubvoid</strong> ("nós", "plataforma"
        ou "serviço") coleta, usa, armazena e protege os dados pessoais dos usuários e visitantes,
        em conformidade com a <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD)</strong>.
        Ao utilizar o hubvoid, você concorda com as práticas descritas aqui.
      </p>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O hubvoid é o controlador dos dados pessoais tratados na plataforma. Para questões
        relacionadas a privacidade e proteção de dados, entre em contato pelo e-mail informado na
        seção <strong>"Contato"</strong> ao final desta política.
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Dados de cadastro e autenticação:</strong> nome, e-mail e credenciais, gerenciados
          por meio do nosso provedor de autenticação (Clerk).
        </li>
        <li>
          <strong>Dados de perfil:</strong> nome de exibição, username, biografia, fotos, banner,
          vídeos, links, eventos, informações de contato (WhatsApp, e-mail, redes sociais) e demais
          conteúdos que você opta por adicionar ao seu perfil público.
        </li>
        <li>
          <strong>Conteúdo enviado:</strong> imagens e vídeos que você faz upload, armazenados em
          serviço de armazenamento em nuvem (Supabase Storage).
        </li>
        <li>
          <strong>Dados de uso e analytics:</strong> visualizações de página, cliques em links,
          referrer e informações do navegador (user agent), de forma agregada, para fornecer
          estatísticas ao dono do perfil.
        </li>
        <li>
          <strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo e navegador, coletados
          automaticamente para segurança e funcionamento do serviço.
        </li>
        <li>
          <strong>Mensagens de contato:</strong> quando um visitante usa o formulário de contato de
          um perfil, os dados informados (nome, e-mail, mensagem) são encaminhados ao dono do perfil.
        </li>
      </ul>

      <h2>3. Para que usamos os dados (finalidades)</h2>
      <ul>
        <li>Criar e manter sua conta e seu perfil público.</li>
        <li>Exibir o conteúdo que você adiciona ao seu perfil.</li>
        <li>Fornecer estatísticas de acesso e desempenho.</li>
        <li>Garantir a segurança, prevenir fraudes e abusos.</li>
        <li>Melhorar e personalizar a experiência na plataforma.</li>
        <li>Cumprir obrigações legais e regulatórias.</li>
      </ul>

      <h2>4. Base legal para o tratamento</h2>
      <p>Tratamos seus dados com fundamento nas seguintes bases legais da LGPD (art. 7º):</p>
      <ul>
        <li><strong>Execução de contrato</strong> — para fornecer o serviço que você solicitou.</li>
        <li><strong>Consentimento</strong> — para dados que você opta por publicar no seu perfil.</li>
        <li><strong>Legítimo interesse</strong> — para segurança, métricas agregadas e melhoria do serviço.</li>
        <li><strong>Cumprimento de obrigação legal</strong> — quando exigido por lei.</li>
      </ul>

      <h2>5. Compartilhamento de dados e sub-operadores</h2>
      <p>
        Não vendemos seus dados pessoais. Compartilhamos dados apenas com prestadores de serviço
        ("operadores") necessários para o funcionamento da plataforma, que tratam os dados em nosso
        nome e sob obrigações de confidencialidade:
      </p>
      <ul>
        <li><strong>Clerk</strong> — autenticação e gerenciamento de contas.</li>
        <li><strong>Supabase</strong> — banco de dados e armazenamento de arquivos.</li>
        <li><strong>Railway</strong> — hospedagem da aplicação (API).</li>
        <li><strong>Vercel</strong> — hospedagem e distribuição do site (frontend).</li>
      </ul>
      <p>
        Conteúdos que você publica no seu perfil são, por natureza, <strong>públicos</strong> e podem
        ser acessados por qualquer pessoa com o link do perfil.
      </p>

      <h2>6. Transferência internacional</h2>
      <p>
        Alguns de nossos prestadores de serviço podem armazenar e processar dados em servidores
        localizados fora do Brasil. Nesses casos, adotamos medidas para assegurar que a transferência
        ocorra em conformidade com a LGPD.
      </p>

      <h2>7. Cookies e tecnologias semelhantes</h2>
      <p>
        Utilizamos cookies e tecnologias semelhantes essenciais para autenticação, segurança e
        funcionamento do serviço, além de armazenamento local (localStorage) para preferências.
        Você pode controlar cookies nas configurações do seu navegador, mas isso pode afetar o
        funcionamento da plataforma.
      </p>

      <h2>8. Por quanto tempo guardamos os dados</h2>
      <p>
        Mantemos seus dados pessoais enquanto sua conta estiver ativa ou pelo tempo necessário para
        cumprir as finalidades descritas, atender obrigações legais ou resolver disputas. Após esse
        período, os dados são excluídos ou anonimizados.
      </p>

      <h2>9. Seus direitos como titular</h2>
      <p>De acordo com o art. 18 da LGPD, você tem direito a:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>Portabilidade dos dados;</li>
        <li>Eliminação dos dados tratados com base no consentimento;</li>
        <li>Informação sobre o compartilhamento de dados;</li>
        <li>Revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer seus direitos, entre em contato conosco pelo e-mail na seção "Contato". Você
        também pode gerenciar e excluir grande parte dos seus dados diretamente no painel do hubvoid.
      </p>

      <h2>10. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo conexões
        criptografadas (HTTPS/SSL), autenticação por token e controle de acesso. Nenhum sistema é
        100% seguro, mas trabalhamos continuamente para reduzir riscos.
      </p>

      <h2>11. Dados de crianças e adolescentes</h2>
      <p>
        O hubvoid não é destinado a menores de 18 anos sem o consentimento e a supervisão dos pais ou
        responsáveis legais. Não coletamos intencionalmente dados de menores sem a devida autorização.
      </p>

      <h2>12. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. A data da última atualização
        é indicada no topo desta página. Recomendamos a revisão periódica.
      </p>

      <h2>13. Contato</h2>
      <p>
        Para dúvidas, solicitações ou exercício de direitos relacionados aos seus dados pessoais,
        entre em contato pelo e-mail: <strong>privacidade@hubvoid.com</strong>.
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
