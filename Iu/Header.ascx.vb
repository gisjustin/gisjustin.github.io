
Partial Class Header
    Inherits System.Web.UI.UserControl

 
    
    Protected Sub hlLogin_Click(ByVal sender As Object, ByVal e As System.EventArgs) Handles hlLogin.Click
        'If the login session variable still has a value then clear all session values
        If Not IsNothing(Session("loginID")) Then
            Session.Clear()
        End If
        Response.Redirect("~/Login.aspx")
        
    End Sub

    
    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

        hlLogin.Visible = True

        If IsNothing(Session("LoginID")) Then
            hlLogin.Text = ""
        Else
            hlLogin.Text = "Logout"
        End If
    End Sub
 
    
End Class
