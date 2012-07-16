<xsl:transform 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  version="1.0">

  <xsl:output method="xml" encoding="utf-8" indent="yes"/>

  <xsl:template match="/">
    <xsl:processing-instruction name="rfc">inline="yes"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">toc="yes"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">symrefs="no"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">strict="yes"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">iprnotified="no" </xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">compact="yes"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">sortrefs="no"</xsl:processing-instruction>
    <xsl:processing-instruction name="rfc">colonspace="yes"</xsl:processing-instruction>
  <rfc>
      <xsl:attribute name='docName'><xsl:value-of select="//div[@id='document']//div[@class='docName']/text()"/>-<xsl:value-of select="//div[@id='document']//div[@class='version']/text()"/></xsl:attribute>
      <xsl:attribute name='category'>std</xsl:attribute>
      <xsl:attribute name='ipr'><xsl:value-of select="//div[@id='ipr']/@class"/></xsl:attribute>
    <front>
      <xsl:apply-templates select="//h1[@id='title']"/>
      <xsl:call-template name='authors'/>
      <xsl:call-template name='date'/>
      <xsl:apply-templates select="//div[@id='abstract']"/>
    </front>
    <middle>
      <xsl:apply-templates select="/html/body/div[@class='section' and @id!='references' and @id!='authors']"/>
    </middle>
    <back>
      <xsl:apply-templates select="/html/body/div[@id='references']"/>
      <xsl:apply-templates select="/html/body/div[@class='appendix']"/>
    </back>
  </rfc>
  </xsl:template>

  <xsl:template match="h1[@id='title']">
    <title>
      <xsl:if test="/html/head/title/text() != text()">
        <xsl:attribute name='abbrev'><xsl:value-of select="/html/head/title/text()"/></xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select='text()'/>
    </title>
  </xsl:template>

  <xsl:template name='date'>
    <xsl:variable name="published" select="//div[@id='document']//div[@class='published']/text()"/>
    <date>
      <xsl:attribute name="day">
        <xsl:value-of select="number(substring-after(substring-after($published, '-'),'-'))"/>
      </xsl:attribute>
      <xsl:attribute name="month">
        <xsl:call-template name="get-month-as-name">
          <xsl:with-param name="month" select="substring-before(substring-after($published, '-'),'-')"/>
        </xsl:call-template>
      </xsl:attribute>
      <xsl:attribute name="year">
        <xsl:value-of select="number(substring-before($published,'-'))"/>
      </xsl:attribute>
    </date>
  </xsl:template>

  <xsl:template match="div[@id='abstract']">
    <abstract>
      <xsl:apply-templates select='p'/>
    </abstract>
  </xsl:template>

  <xsl:template match="p">
    <t>
      <xsl:if test='@id'>
        <xsl:attribute name='anchor'><xsl:value-of select='@id'/></xsl:attribute>
      </xsl:if>
      <xsl:apply-templates />
    </t>
  </xsl:template>

  <xsl:template match="ul">
    <t><list style='symbols'><xsl:apply-templates /></list></t>
  </xsl:template>

  <xsl:template match="ol">
    <t><list style='numbers'><xsl:apply-templates /></list></t>
  </xsl:template>

  <xsl:template match="li">
    <t>
      <xsl:if test='@id'>
        <xsl:attribute name='anchor'><xsl:value-of select='@id'/></xsl:attribute>
      </xsl:if>
      <xsl:apply-templates/>
    </t>
  </xsl:template>

  <xsl:template match="span"><xsl:apply-templates/></xsl:template>

  <xsl:template match="strong"><spanx style='strong'><xsl:value-of select='text()'/></spanx></xsl:template>

  <xsl:template match="em"><spanx style='emph'><xsl:value-of select='text()'/></spanx></xsl:template>

  <xsl:template match="code"><spanx style='verb'><xsl:value-of select='text()'/></spanx></xsl:template>

  <xsl:template match="div[@class='section']">
    <section>
      <xsl:attribute name='title'><xsl:value-of select="normalize-space((h2|h3|h4|h5|h6)/text())"/></xsl:attribute>
      <xsl:attribute name='anchor'><xsl:value-of select="@id"/></xsl:attribute>
      <xsl:apply-templates select="p|div[@class='section']|ol|ul|pre"/>
    </section>
  </xsl:template>

  <xsl:template match="div[@id='references']">
    <xsl:for-each select="div[@class='section']">
      <references>
        <xsl:attribute name='title'><xsl:value-of select="normalize-space(h3/text())"/></xsl:attribute>
        <xsl:for-each select="ul/li">
          <xsl:value-of select='@data-xml' disable-output-escaping="yes" />
        </xsl:for-each>
      </references>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="div[@class='appendix']">
    <section>
      <xsl:attribute name='title'><xsl:value-of select="normalize-space((h2|h3|h4|h5|h6)/text())"/></xsl:attribute>
      <xsl:attribute name='anchor'><xsl:value-of select="@id"/></xsl:attribute>
      <xsl:apply-templates select="p|div[@class='appendix']|ol|ul|pre|table"/>
    </section>
  </xsl:template>

  <xsl:template match="table">
    <texttable>
      <xsl:apply-templates select='.//th|.//td'/>
    </texttable>
  </xsl:template>

  <xsl:template match="th">
    <ttcol><xsl:value-of select="normalize-space(.)"/></ttcol>
  </xsl:template>

  <xsl:template match="td">
    <c><xsl:value-of select="normalize-space(.)"/></c>
  </xsl:template>

  <xsl:template match="pre">
    <figure>
      <artwork><xsl:apply-templates/></artwork>
    </figure>
  </xsl:template>

  <xsl:template match="pre//strong"><xsl:apply-templates/></xsl:template>

  <xsl:template match="a">
    <xsl:variable name="sect" select="substring-after(@href, '#')"/>
    <xsl:choose>
      <xsl:when test="count(/*//div[@id=$sect]) > 0">
        <xref>
          <xsl:attribute name='target'><xsl:value-of select="$sect"/></xsl:attribute>
          <xsl:apply-templates/>
        </xref>
      </xsl:when>
      <xsl:otherwise>
        <eref>
          <xsl:attribute name='target'><xsl:value-of select="@href"/></xsl:attribute>
          <xsl:apply-templates/>
        </eref>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="a[@class='ref']">
    <xref>
      <xsl:attribute name='target'><xsl:value-of select="substring-after(@href, '#')"/></xsl:attribute>
      <xsl:apply-templates/>
    </xref>
  </xsl:template>  

  <xsl:template name='authors'>
    <xsl:for-each select='//div[@id="authors"]/address'>
      <author>
        <xsl:attribute name='fullname'><xsl:value-of select="*[@class='fn']/text()"/></xsl:attribute>
        <xsl:attribute name='initials'>
          <xsl:if test="*[@class='initial']">
            <xsl:value-of select="*[@class='initial']/text()"/>
          </xsl:if>
          <xsl:if test="string(*[@class='initial']/text()) = ''"><xsl:value-of select="substring(//*[@class='given-name']/text(),1,1)"/>.</xsl:if>
        </xsl:attribute>
        <xsl:attribute name='surname'><xsl:value-of select="//*[@class='family-name']/text()"/></xsl:attribute>
        <organization><xsl:value-of select="//*[@class='org']/text()"/></organization>
        <address>
          <postal>
            <street><xsl:value-of select="//*[@class='street-address']/text()"/></street>
            <city><xsl:value-of select="//*[@class='locality']/text()"/></city>
            <region><xsl:value-of select="//*[@class='region']/text()"/></region>
            <code><xsl:value-of select="//*[@class='postal-code']/text()"/></code>
            <country><xsl:value-of select="//*[@class='country-name']/text()"/></country>
          </postal>
          <email><xsl:value-of select="//*[@class='email']/text()"/></email>
        </address>
      </author>
    </xsl:for-each>
  </xsl:template>

  <!-- from rfc2629.xslt -->
  <xsl:template name="get-month-as-name">
    <xsl:param name="month"/>

    <xsl:variable name="zmonth">
      <xsl:value-of select="number($month)"/>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$zmonth=1">January</xsl:when>
      <xsl:when test="$zmonth=2">February</xsl:when>
      <xsl:when test="$zmonth=3">March</xsl:when>
      <xsl:when test="$zmonth=4">April</xsl:when>
      <xsl:when test="$zmonth=5">May</xsl:when>
      <xsl:when test="$zmonth=6">June</xsl:when>
      <xsl:when test="$zmonth=7">July</xsl:when>
      <xsl:when test="$zmonth=8">August</xsl:when>
      <xsl:when test="$zmonth=9">September</xsl:when>
      <xsl:when test="$zmonth=10">October</xsl:when>
      <xsl:when test="$zmonth=11">November</xsl:when>
      <xsl:when test="$zmonth=12">December</xsl:when>
      <xsl:otherwise>WRONG SYNTAX FOR MONTH</xsl:otherwise>
     </xsl:choose>
  </xsl:template>
</xsl:transform>