<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:svg="http://www.w3.org/2000/svg">

  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:text>[</xsl:text>
    <xsl:apply-templates/>
    <xsl:text>]</xsl:text>
  </xsl:template>

  <xsl:template match="svg:path">
    <xsl:value-of select="concat('&#x22;',concat(@d,'&#x22;'))"/>
    <xsl:if test="following::svg:path">
      <xsl:text>,</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="text()"/>

</xsl:transform>
