<%@ Control Language="VB" AutoEventWireup="false" CodeFile="Header.ascx.vb" Inherits="Header" %>
 

<table border="0" cellpadding="0" cellspacing="0" style="width: 100%">
    <tr style="font-family:verdana, Microsoft Sans Serif; font-size:small; color:#000066;" bgcolor="#ffcc99" >
        <td align="right" >
            <a href="http://www.in.gov/" target="_blank">Access Indiana</a>&nbsp;|&nbsp;
            <a href="http://intranet.state.in.us/base/index.stm" target="_blank">State Intranet</a>
        </td>
    </tr>
    <tr bgcolor="#050356">
      <td>
          <asp:Image ID="imgBanner" runat="server" ImageUrl="~/Images/banner.jpg" />
      </td>   
    </tr>
    <tr bgcolor="LightGrey">
        <td class="Login" align="right">
          <asp:LinkButton ID="hlLogin" runat="server" Font-Bold="True" Font-Size="Small" ForeColor="Maroon"  Font-Names="Microsoft Sans Serif" CausesValidation="False">Logout</asp:LinkButton>
        </td>
    </tr>
   <!-- for future menu options
      <tr style="height: 10%" bgcolor="#ffffff">
        <td colspan="2" >
        </td>
    </tr>
    -->
</table>
 

 
