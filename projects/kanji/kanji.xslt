<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" omit-xml-declaration="yes" encoding="UTF-8"/>

  <xsl:template
    match="*[@*[namespace-uri()='http://kanjivg.tagaini.net']]|*[@d]">
    <xsl:element name="{local-name()}">
      <xsl:for-each select="@*[namespace-uri()='http://kanjivg.tagaini.net']">
        <xsl:attribute name="{local-name()}">
          <xsl:value-of select="."/>
        </xsl:attribute>
      </xsl:for-each>
      <xsl:copy-of select="@d"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="text()"/>

</xsl:transform>
